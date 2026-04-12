# PostgreSQL Analysis

This reference covers PostgreSQL-specific metrics, tuning, and analysis guidance.
For common analysis patterns (output structure, collection status handling, performance thinking), see [analyze-db.md](analyze-db.md).

## What the Script Collects

**`collection_status`** — check this FIRST. Shows what succeeded vs failed:
- `database_query`: SSH → psql batched query (connections, cache, vacuum, queries, etc.)
- `metrics_api`: Railway API for disk, CPU, memory
- `logs_api`: Railway API for recent log lines
- `ha_cluster`: SSH → Patroni REST API (HA services only)

Each entry has `"status"` (`"success"`, `"error"`, or `"skipped"`) and optional `"error"` or `"reason"` fields.

All in ONE operation (no additional queries needed):

**Connections:**
- Current/max/available counts
- States (active, idle, idle_in_transaction)
- By application name
- By age (buckets: <1min, 1-5min, 5-60min, 1-24hr, >24hr)
- Oldest connection age

**Memory & Configuration:**
- shared_buffers, effective_cache_size, work_mem, maintenance_work_mem
- WAL settings, parallelism settings, planner settings
- Autovacuum status
- track_activity_query_size (tells you if queries are truncated in pg_stat_statements)
- log_min_duration_statement (tells you if slow query logging is enabled and at what threshold)
- idle_in_transaction_session_timeout, statement_timeout (safety timeouts)
- track_io_timing (needed for blk_read_time/blk_write_time in query stats)

**Cache Performance:**
- Overall table/index hit ratios
- Per-table: hit %, disk reads, size (this is key for diagnosis)

**Storage:**
- Database size, WAL size
- Per-table: total size, data size, index size, row count

**Vacuum Health:**
- Per-table: dead rows, dead %, vacuum count, last vacuum/analyze, XID age
- Flags: needs_vacuum, needs_freeze

**Indexes:**
- Unused indexes (0 scans) with sizes
- Invalid indexes (failed builds)

**Query Performance (if pg_stat_statements enabled):**
- Top 100 queries by total execution time
- Per-query execution: calls, total_min, mean_ms, min_ms, max_ms, stddev_ms
- Per-query rows: total rows, rows_per_call
- Per-query planning: total_plan_ms, mean_plan_ms
- Per-query cache: shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, cache_hit_pct
- Per-query temp: temp_blks_read, temp_blks_written
- Per-query I/O timing: blk_read_time_ms, blk_write_time_ms (requires track_io_timing=on)
- Per-query WAL: wal_records, wal_bytes
- Per-query local blocks: local_blks_hit, local_blks_read (for temp tables)
- Temp file stats (cumulative since stats reset, NOT current disk usage)

**Logs & Active Issues:**
- `recent_logs`: Raw unfiltered logs (1000 lines) - parse these yourself, look for errors, warnings, patterns
- `recent_errors`: Filtered error-level logs (legacy, for quick reference)
- `long_running_queries`: Queries running >5s at time of collection
- `blocked_queries`: Queries waiting on locks
- `cluster_logs`: HA cluster events (Patroni)

**Important:** Always analyze the raw `recent_logs` array thoroughly. This is 1000 lines of unfiltered database output — treat it as a goldmine.

**Log analysis checklist — go through ALL of these:**

1. **Error/Fatal/Panic messages**: Count them, categorize them, quote the exact messages
   - `ERROR: deadlock detected` → cross-reference with deadlock count in database_stats
   - `FATAL: too many connections` → cross-reference with connection usage
   - `ERROR: canceling statement due to statement timeout` → which queries are timing out?
   - `FATAL: out of shared memory` → shared_buffers or lock table exhaustion
   - `ERROR: could not extend file` → disk space issue
   - `PANIC: ...` → database crash, investigate immediately

2. **Slow query log entries** (if `log_min_duration_statement` is set):
   - Count how many slow queries appear
   - Identify which tables/queries are mentioned most often
   - Cross-reference with top_queries — the same patterns should appear in both
   - Note the actual durations logged vs mean_ms from pg_stat_statements

3. **Autovacuum activity**:
   - `LOG: automatic vacuum of table` → is autovacuum running? How often?
   - `LOG: automatic analyze of table` → statistics being updated
   - `WARNING: oldest xmin is far in the past` → XID wraparound risk
   - Absence of autovacuum entries with high dead rows → autovacuum may be blocked or misconfigured

4. **Checkpoint activity**:
   - `LOG: checkpoint starting` / `LOG: checkpoint complete` → how frequent?
   - `checkpoint complete: wrote X buffers (Y%)` → high Y% means lots of dirty data
   - Time between checkpoints — if < 5 minutes, write load is high
   - `checkpoints are occurring too frequently` → increase max_wal_size

5. **Connection patterns**:
   - `LOG: connection received` / `LOG: connection authorized` → connection rate
   - `LOG: disconnection` → normal or unexpected? Check session duration
   - `FATAL: remaining connection slots are reserved` → max_connections hit
   - `FATAL: password authentication failed` → unauthorized access attempts

6. **Replication messages**:
   - `LOG: started streaming WAL` → replica connected
   - `ERROR: requested WAL segment has already been removed` → replica too far behind
   - `FATAL: could not receive data from WAL stream` → replication broken

7. **Temporal patterns**:
   - Are errors clustered in time? (burst vs steady)
   - Do slow queries correlate with checkpoint times?
   - Is there a pattern suggesting cron jobs or batch processing?

State what you found with specifics: "Analyzed 1000 log lines covering 2024-01-15 14:00 to 15:30. Found: 23 slow query warnings (all SELECT on UserSession table, 200-800ms), 4 autovacuum runs, 2 checkpoints (normal interval), 0 errors. The slow queries correlate with the UserSession table's 76% cache hit rate."

### Log Interpretation When Only Logs Are Available

When `collection_status.database_query` failed and you only have logs:

**Startup vs steady-state logs:**
- `LOG: database system is ready to accept connections` — normal startup, NOT evidence of a crash
- `LOG: started streaming WAL` — normal replication, NOT an error
- `LOG: checkpoint starting` / `LOG: checkpoint complete` — routine operation
- `FATAL: the database system is starting up` — transient during restarts, NOT a persistent problem

**What you CAN say from logs alone:**
- Whether errors or warnings are present and their frequency
- Whether the database recently restarted (and that this is normal during deploys)
- Whether there are connection refused errors (possible saturation or startup)

**What you CANNOT say from logs alone:**
- Whether the database is performing well or poorly
- Whether cache hit ratios are good
- Whether vacuum is behind
- Whether queries are slow
- Any tuning recommendations

If only logs are available, explicitly state: "No performance conclusions possible — database metrics were not collected."

**Active Issues:**
- Long-running queries (>5s)
- Idle in transaction (>30s)
- Blocked queries (waiting on locks)
- Lock contention details

**Infrastructure (7d + 24h)** — show both windows so trends can be compared:

**7-Day Trends**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.02 vCPU | 0.02 | 0.00 | 0.18 | stable |
| Memory | 320 MB | 290 MB | 240 MB | 380 MB | stable |
| Disk | 4.2 GB | 4.1 GB | 3.9 GB | 4.3 GB | increasing (+8%) |

**Last 24 Hours**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.04 vCPU | 0.02 | 0.00 | 0.18 | stable |
| Memory | 320 MB | 295 MB | 270 MB | 340 MB | stable |
| Disk | 4.2 GB | 4.15 GB | 4.1 GB | 4.2 GB | stable |

Compare: "Disk growing slowly over 7d but stable over 24h → gradual data growth, not an acute event."

Do NOT show cpu_limit/memory_limit columns or utilization %. Railway auto-scales — these limits are just the ceiling. See [analyze-db.md](analyze-db.md) autoscale rules.

**Replication / HA (if applicable):**
- Replication status
- HA cluster status (Patroni)
- Background writer stats
- WAL archiver status

## PostgreSQL Tuning Knowledge

Use this to reason about configuration issues:

### Memory Parameters

| Parameter | Default | Target | What It Does |
|-----------|---------|--------|--------------|
| `shared_buffers` | 128MB | 25% RAM | The database's main cache. Pages read from disk go here. Too small = constant disk I/O. |
| `effective_cache_size` | 4GB | 75% RAM | NOT memory allocation - a hint to the planner about OS cache. Too low = planner avoids indexes. |
| `work_mem` | 4MB | 16-64MB | Memory per sort/hash/join operation. Too low = temp files on disk. Caution: multiplied by concurrent operations. |
| `maintenance_work_mem` | 64MB | 256MB-1GB | Memory for VACUUM, CREATE INDEX. Higher = faster maintenance. |

### Tuning Formulas

```
shared_buffers = RAM × 0.25 (max 40%)
  1GB RAM  → 256MB
  4GB RAM  → 1GB
  16GB RAM → 4GB

work_mem = (RAM / max_connections) / 4
  4GB RAM, 100 conns → 10MB
  8GB RAM, 200 conns → 10MB

effective_cache_size = RAM × 0.75
  4GB RAM  → 3GB
  16GB RAM → 12GB
```

### Settings Requiring Restart vs Immediate

**Restart required:**
- shared_buffers
- max_connections
- max_parallel_workers

**Immediate (SIGHUP):**
- work_mem
- effective_cache_size
- random_page_cost
- checkpoint_completion_target

### SSD vs HDD

Railway uses SSDs. If `random_page_cost = 4.0` (HDD default), the planner thinks random reads are 4x more expensive than sequential - it avoids index scans. Set to 1.1-2.0 for SSDs.

### Railway auto-scales vertically

See [analyze-db.md](analyze-db.md) for full autoscale rules. For PostgreSQL specifically:

- Tune parameters relative to the **current** RAM from `metrics_history.memory.current`, not `memory_limit`.
- If shared_buffers is undersized relative to current RAM, recommend increasing it to 25% of current RAM.
- If the working set far exceeds what 25% of current RAM can hold, note this as a limitation of the current memory footprint — but do NOT tell the user to increase RAM. The platform handles that automatically.

## Thresholds for Reasoning

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Cache hit ratio | >99% | 95-99% | <95% |
| Per-table cache hit | >95% | 80-95% | <80% with high reads |
| Connection usage | <70% | 70-90% | >90% |
| Disk usage | <70% | 70-85% | >85% |
| Dead rows % | <5% | 5-20% | >20% |
| XID age | <100M | 100-150M | >150M (emergency at 2B) |

### Vacuum Priority Matrix

Dead row percentage alone doesn't determine urgency. Use this matrix:

| Table Size | Dead Rows | Priority |
|------------|-----------|----------|
| > 100 MB | > 10,000 | High - real bloat affecting performance |
| > 50 MB | > 5,000 | Medium - worth addressing |
| < 10 MB | Any | Low - negligible impact, ignore |
| Any | < 1,000 | Low - autovacuum will handle it |

A 1 MB table with 25% dead rows has ~250 KB of bloat. Not worth mentioning as "critical".

## Applying Fixes

When recommending changes, include the actual SQL and **always explain side effects** — especially for settings that add overhead or change behavior.

```sql
-- Memory tuning (example for 4GB RAM)
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '3GB';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET random_page_cost = 1.5;
SELECT pg_reload_conf();
-- Note: shared_buffers requires restart
```

```sql
-- Vacuum specific tables
VACUUM ANALYZE "TableName";

-- Emergency XID freeze
VACUUM FREEZE "TableName";
```

### Side effects to document per setting

| Setting | Side Effect to Explain |
|---------|----------------------|
| `track_io_timing` | Adds a system call (gettimeofday) per block read/write. On most modern systems the overhead is <1%, but on systems with slow clock sources it can be measurable. Worth it for the diagnostic value in pg_stat_statements (blk_read_time, blk_write_time). |
| `shared_buffers` | Requires restart. Allocates memory at startup — over-allocating can starve OS cache and other processes. |
| `work_mem` | Multiplied by concurrent operations (sorts, hashes, joins). 64MB × 50 concurrent ops = 3.2 GB. Recommend conservatively. |
| `log_min_duration_statement` | Logging slow queries adds I/O. A threshold too low (e.g., 100ms) on a high-throughput DB can generate massive log volume. Start at 1000ms. |
| `idle_in_transaction_session_timeout` / `statement_timeout` | Will kill queries/transactions that exceed the timeout. Existing application code that relies on long-running transactions or queries will break. Warn the user to verify their application can handle this. |

## Enabling pg_stat_statements

**ONLY suggest this if BOTH conditions are true:**
1. `pg_stat_statements_installed` is `false` in the JSON output
2. `top_queries` is empty or missing

If these conditions are met, tell the user to run (do NOT execute with Bash):

```
python3 scripts/enable-pg-stats.py --service <name>
```

This may require a brief restart.

**If `pg_stat_statements_installed: true` and `top_queries` has data, DO NOT suggest enabling it.**

---

## PostgreSQL-Specific Guidance

The sections below apply specifically to PostgreSQL analysis via `scripts/analyze-postgres.py`.

## How to Think About PostgreSQL Performance

### The Core Question

When you see a problem, ask: **What is the chain of causation?**

Example chain:
1. Cache hit is 89% (symptom)
2. Email table has 6% cache hit with 1.19B disk reads (deeper symptom)
3. Email table is 1.7GB, shared_buffers is 128MB (root cause)
4. The table is 13x larger than the buffer pool - it will NEVER fit in cache
5. Every query touching Email forces disk I/O

**This reasoning is what you provide. The script gives you the data points - you connect them.**

### Patterns to Look For

**Memory Starvation Pattern:**
- Low cache hit + large tables + small shared_buffers = working set doesn't fit
- High temp files + low work_mem = sorts/hashes spilling to disk
- These often occur together - both indicate the database needs more memory

**Important:** Temp file stats (`temp_files`, `temp_bytes`) are **cumulative since the last stats reset**, not current disk usage. When reporting, say "X GB written to temp files since stats reset" - not "X GB on disk right now".

**Vacuum Neglect Pattern:**
- High dead rows % + "never" vacuum timestamps = autovacuum isn't keeping up
- Multiple tables with >10% dead rows = systemic issue, not one-off
- High XID age + vacuum issues = potential wraparound emergency

**Important:** Consider **absolute impact**, not just percentage. A tiny table (< 10 MB) with 20% dead rows has negligible impact - vacuuming it reclaims almost nothing. Prioritize tables with BOTH high dead row counts (thousands+) AND meaningful size (tens of MB+). Don't mark small tables as "critical" just because of a high percentage.

**Missing Index Pattern:**
- High seq_scan count + 0 idx_scans on large tables = queries scanning full tables
- Low cache hit on specific tables + high seq_scans = indexes would help AND reduce I/O

**Connection Pressure Pattern:**
- High connection % + many idle connections = connection pooling needed
- Old connections (days) + idle_in_transaction = potential connection leaks or stuck transactions

### Slow Query Analysis — Go Deep

The `top_queries` array is the **most valuable data** for customers. This is where you can give the most actionable, specific advice. Don't skim it — analyze every query in the top 10-15 thoroughly.

#### Per-Query Fields and What Each Tells You

| Field | What It Means | How to Interpret |
|-------|---------------|------------------|
| `calls` | Number of times this query pattern executed | High calls × even small mean_ms = huge cumulative impact. A 5ms query called 10M times = 833 minutes of DB time |
| `total_min` | Total execution time in minutes | The primary sort key. This is the query's total footprint on the database |
| `mean_ms` | Average execution time per call | Compare with stddev — if stddev >> mean, the query has wildly variable performance |
| `min_ms` / `max_ms` | Fastest and slowest execution | A 2ms min with 30,000ms max means the query sometimes hits pathological cases (lock waits, cache misses, bloated tables) |
| `stddev_ms` | Standard deviation of execution time | High stddev = unpredictable. The query probably performs well when data is cached but terribly when it's not. This is often the query causing random user-visible latency spikes |
| `rows_per_call` | Average rows returned per execution | 0.01 rows/call means the query usually returns nothing — might be a polling pattern or existence check that could use EXISTS instead. 50,000 rows/call suggests missing pagination or bulk fetch |
| `mean_plan_ms` | Average planning time | If plan time is >5ms, the planner is spending significant time. Could indicate: too many partitions, complex joins needing better statistics (`ALTER TABLE SET STATISTICS`), or pg_catalog bloat |
| `cache_hit_pct` | % of blocks found in shared_buffers | <90% = query is constantly going to disk. Cross-reference with the table it touches in `cache_per_table` |
| `shared_blks_read` | Blocks read from disk (not cache) | This is the raw I/O cost. Each block = 8KB. 1M blocks read = 8GB of disk I/O |
| `shared_blks_dirtied` | Blocks this query modified | High dirtied blocks = write-heavy query. These blocks will need to be flushed to disk during checkpoints |
| `shared_blks_written` | Blocks this query had to flush to disk itself | Should be 0 in a healthy system. >0 means the query was forced to do its own I/O because shared_buffers was full of dirty pages — a sign of severe memory pressure |
| `temp_blks_read` / `temp_blks_written` | Blocks spilled to temp files | Any nonzero value means the query exceeded work_mem. Each block = 8KB. temp_blks_written of 1M = 8GB spilled to disk for sorts/hashes |
| `blk_read_time_ms` / `blk_write_time_ms` | Time spent on actual disk I/O (requires `track_io_timing`) | If available and high, this tells you exactly how much time was spent waiting on disk vs CPU. If 0, track_io_timing may be off |
| `wal_records` / `wal_bytes` | WAL generated by this query | High WAL = write-heavy. If one query generates most WAL, it's driving replication lag and checkpoint pressure |
| `local_blks_hit` / `local_blks_read` | Blocks for temporary tables | If nonzero, query uses temp tables — common in complex CTEs or materialized subqueries |

#### Red Flags — What Demands Explanation

| Signal | What It Means | Example | What to Tell the Customer |
|--------|---------------|---------|---------------------------|
| Low cache_hit_pct (< 90%) | Query hitting disk constantly | `cache_hit_pct: 47.19` | "This query reads X blocks from disk each call. The table it touches (Y) is Z GB but shared_buffers is only W MB — the data physically cannot stay cached" |
| High temp_blks (any nonzero) | Query spilling sorts/hashes to disk | `temp_blks_written: 39102928` | "This query spills ~X GB to temp files per execution because work_mem (Y MB) is too small for its sort/hash. Each spill means disk I/O instead of memory" |
| Huge rows_per_call (>1000) | Missing pagination or bulk fetch | `rows_per_call: 12177` | "Each call returns ~12K rows. If this is a user-facing query, it likely needs LIMIT/OFFSET or cursor-based pagination. If it's a batch job, it's expected" |
| Near-zero rows_per_call with high calls | Polling or existence check pattern | 0.01 rows/call, 500K calls | "This query runs 500K times but almost never finds data. If it's checking for new work, consider LISTEN/NOTIFY instead of polling. If it's an existence check, ensure it uses EXISTS with LIMIT 1" |
| stddev >> mean | Wildly variable performance | mean=15ms, stddev=2400ms, max=45000ms | "This query averages 15ms but sometimes takes 45 SECONDS. The high stddev means unpredictable latency. Likely causes: lock contention, cache misses on cold data, or table bloat causing variable scan times" |
| High mean_plan_ms (>5ms) | Expensive query planning | `mean_plan_ms: 23.4` | "The planner spends 23ms just deciding HOW to run this query, before executing it. With X calls, that's Y minutes of pure planning overhead. Consider: PREPARE'd statements, simpler joins, or increasing default_statistics_target for better stats" |
| shared_blks_written > 0 | Memory pressure forcing query I/O | `shared_blks_written: 50000` | "This query was forced to flush dirty pages to disk itself because shared_buffers was full. This is a sign of severe buffer pool pressure — increase shared_buffers" |
| High wal_bytes relative to others | Write-heavy query driving replication | `wal_bytes: 5000000000` | "This query generates X GB of WAL, which is Y% of total WAL. It's the primary driver of replication lag and checkpoint I/O" |
| max_ms >> 10× mean_ms | Pathological worst cases | mean=50ms, max=120000ms | "The worst execution was 2400× slower than average. Investigate: was it blocked by a lock? Did it hit a cold cache after restart? Is there table bloat causing some scans to be much longer?" |

#### How to Present Slow Queries

**Show the full table first** with all available metrics (the report already includes these columns):

```
| Query (truncated) | Calls | Total (min) | Mean (ms) | Min/Max (ms) | Stddev | Rows/Call | Cache Hit | Temp R/W | Plan (ms) | I/O Time |
|-------------------|-------|-------------|-----------|--------------|--------|-----------|-----------|----------|-----------|----------|
| SELECT Email.ccFull... | 78K | 132 | 101 | 0.3/8200 | 340 | 0.05 | 47% | 0/0 | 1.2 | 45000 |
| SELECT Thread... ORDER BY | 48K | 223 | 279 | 2.1/45000 | 2400 | 12,177 | 98.8% | 0/39M | 0.4 | 800 |
| SELECT Content... | 1.3K | 12 | 563 | 180/3200 | 420 | 0.65 | 1.8% | 0/0 | 8.3 | 31000 |
```

**Then analyze EACH query** — this is the most valuable part. For each of the top 10 queries, explain:

1. **What the query does** — identify the tables, the pattern (lookup, join, aggregation, pagination)
2. **Why it's slow** — connect the specific metrics to a root cause
3. **The cascading impact** — how this query affects overall database health
4. **Specific fix** — not generic advice, but targeted to what the metrics show

Example deep analysis:

> **Query 1: Email.ccFull join** (78K calls, 101ms mean, 132 min total)
> - **Pattern**: Joins Email → EmailThreadKind → Thread → EmailEntry. ORM-generated N+1 or bulk join.
> - **Root cause**: 47% cache hit means 53% of blocks come from disk. The Email table is 1.7GB but shared_buffers is 128MB — only 7.5% of this table can be cached at once. Every call displaces other data from cache, creating a cascading eviction problem.
> - **The stddev of 340ms** with max of 8200ms means some calls take 80× longer — likely when the needed pages were just evicted by another query.
> - **I/O time of 45,000ms** total confirms this: the query has spent 45 seconds just waiting for disk across all calls.
> - **rows_per_call = 0.05** means it almost never finds a match — it's doing all this I/O for an existence-check pattern. An `EXISTS()` subquery with proper index could eliminate the full table scan.
> - **Fix**: (a) Increase shared_buffers to 1GB so the hot portion stays cached. (b) Add index on Email(ccFull, threadId) to avoid the sequential scan. (c) Rewrite as EXISTS if the app only needs presence, not the full row.

> **Query 2: Thread pagination** (48K calls, 279ms mean, 223 min total)
> - **Pattern**: SELECT Thread... ORDER BY with large result set. Pagination query.
> - **Root cause**: rows_per_call = 12,177 — returning 12K rows per call is a pagination bug (missing LIMIT) or an admin/batch endpoint.
> - **temp_blks_written = 39M** (312 GB of temp files!) — the ORDER BY creates a sort that exceeds work_mem (4MB), so it spills to disk every single time.
> - **stddev = 2400ms with max = 45,000ms** — some executions take 45 seconds, likely when disk temp files compete with other I/O.
> - **Cache hit is 98.8%** — the data itself is cached, but the sort still spills because work_mem is separate from shared_buffers.
> - **Fix**: (a) Add `LIMIT` if this is user-facing. (b) Create an index matching the ORDER BY clause to eliminate the sort entirely. (c) Increase work_mem to 32-64MB so the sort fits in memory.

#### Truncate Long Queries Intelligently
- Show the table names and key operations (JOIN, WHERE, ORDER BY)
- Don't dump 2000-character ORM-generated SQL
- Identify the pattern: "Thread zone assignment lookup" not the full SQL
- For ORM queries with `$1, $2, ...` parameters, note that the actual values aren't available — the pattern matters more than specific values
- **Note on query truncation**: pg_stat_statements stores full query text up to `track_activity_query_size` (default 1024 chars). ORM-generated queries often exceed this — if a query ends abruptly, it was truncated by PostgreSQL, not by our script. The JSON output preserves the full text from pg_stat_statements; only the human-readable text report truncates for display

#### Query Workload Profile

After analyzing individual queries, summarize the overall workload:
- **Read vs write ratio**: Use tup_returned/tup_fetched vs tup_inserted/tup_updated/tup_deleted from database_stats
- **Top 3 time consumers**: Which queries dominate total_min? If 3 queries account for 80% of execution time, that's where to focus
- **Cache pressure sources**: Which queries have the most shared_blks_read? They're driving cache misses for everything else
- **Temp file culprits**: Which specific queries create temp files? Don't say "increase work_mem" generically — say "Query X creates Y GB of temp files per day"
- **WAL generators**: If applicable, which queries generate the most WAL bytes? They're driving replication lag

### Correlate Across Sections

The script collects many data points. Look for correlations:

| If you see... | Check also... | Because... |
|---------------|---------------|------------|
| Low table cache hit | per-table cache rates, table sizes vs shared_buffers | One large table may be thrashing the cache |
| High temp files | work_mem value, top queries | Specific queries may be the culprits |
| Dead rows building up | vacuum health, XID age | Autovacuum may be blocked or misconfigured |
| Seq scans on large tables | unused indexes, index hit rates | May have indexes but planner isn't using them |
| High connection usage | connection age, idle_in_transaction | May be leaks, not actual load |

### Synthesize Insights the Script Can't

The script flags individual issues. You should:

1. **Identify the PRIMARY bottleneck** - What's the #1 thing hurting performance right now?
2. **Explain cascading effects** - How does one problem cause others?
3. **Prioritize fixes** - What should they do first, second, third?
4. **Warn about risks** - What happens if they don't fix this?

**Important:** Synthesis is prose that EXPLAINS the data tables you already showed. Don't hide data in prose - the tables make it visible, the prose connects the dots.

Example flow:
1. Show config table: `shared_buffers = 128 MB` vs recommended `1 GB`
2. Show cache table: `Email` table at 6% cache hit with 1.19B disk reads
3. THEN explain: "Your buffer pool (128 MB) is 13x smaller than your Email table (1.7 GB). This single table is dragging down your overall 89% cache hit rate."

The user sees the data, understands the relationship, then gets the explanation. Don't make them trust your conclusions without seeing the evidence first.

## Common Errors to Avoid (PostgreSQL-Specific)

- Saying "enable pg_stat_statements" when `pg_stat_statements_installed: true` and `top_queries` has data
- Misreporting connection usage (check `percent` field, not just `current`)
- Ignoring the `oldest_connections` details when flagging old connections
- Saying "746 GB of temp files on disk" when temp_bytes is cumulative since stats reset
- Marking tiny tables (< 10 MB) as "critical" for vacuum just because of high dead row percentage
- Listing slow queries by total_time only without analyzing cache_hit_pct, temp_blks, and rows returned
- Dumping full ORM-generated SQL instead of summarizing the query pattern

## Validated against

- PostgreSQL system views: pg_stat_activity, pg_stat_statements, pg_statio_user_tables, pg_stat_user_tables
- Patroni REST API for HA clusters
