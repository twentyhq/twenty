# MySQL Analysis

This reference covers MySQL-specific metrics, tuning, and analysis guidance.
For common analysis patterns (output structure, collection status handling, performance thinking), see [analyze-db.md](analyze-db.md).

## What the Script Collects

**Via SSH (mysql -B):**
- **SHOW GLOBAL STATUS:** threads connected/running, max used connections, query counts (select/insert/update/delete), InnoDB buffer pool stats, row lock waits/time, bytes sent/received, temp table stats, handler stats, table lock stats, aborted clients/connects
- **SHOW VARIABLES:** max_connections, innodb_buffer_pool_size, long_query_time, version
- **Table Sizes:** per-table rows, data length, index length, total size (top 15)
- **Processlist:** active queries with user, database, command, time, state
- **Top Queries (performance_schema):** digest text, call count, avg/total latency, rows examined/sent, temp disk tables, no-index flag

**Via Railway API:** Same infrastructure metrics (CPU, memory, disk, network).

## MySQL Metric Sections — Present ALL of These

When the script returns MySQL data, present **every section below** with its metrics. This matches the full MySQL metrics view. Don't skip sections — if data is present, show it.

### 1. Overview

| Metric | JSON Path | How to Display |
|--------|-----------|----------------|
| Version | `overview.version` | As-is |
| Uptime | `overview.uptime_seconds` | Format as Xd Xh Xm |
| Connections | `overview.connection_usage_percent` | `XX%` with `threads_connected / max_connections` as sub-value |
| Threads Running | `overview.threads_running` | As-is |
| Aborted Clients | `overview.aborted_clients` | Warn if > 0 — apps not closing connections |
| Aborted Connects | `overview.aborted_connects` | Warn if > 0 — auth failures or limit hits |

**Presentation:**
```
| Metric | Value | Status |
|--------|-------|--------|
| Version | 9.4.0 | |
| Uptime | 3d 12h | |
| Connections | 45% (9 / 20) | OK |
| Threads Running | 2 | |
| Aborted Clients | 0 | OK |
| Aborted Connects | 0 | OK |
```

### 2. Query Throughput

| Metric | JSON Path | How to Display |
|--------|-----------|----------------|
| Total Queries | `query_throughput.questions` | Format with K/M suffix |
| Slow Queries | `query_throughput.slow_queries` | Warn if > 0, show threshold from `long_query_time` |
| SELECT | `query_throughput.com_select` | Format with K/M suffix |
| INSERT | `query_throughput.com_insert` | Format with K/M suffix |
| UPDATE | `query_throughput.com_update` | Format with K/M suffix |
| DELETE | `query_throughput.com_delete` | Format with K/M suffix |

Show the query mix distribution. A healthy OLTP workload is SELECT-heavy. INSERT/UPDATE-heavy suggests write pressure.

### 3. InnoDB Row Operations

| Metric | JSON Path |
|--------|-----------|
| Rows Read | `innodb_row_ops.rows_read` |
| Rows Inserted | `innodb_row_ops.rows_inserted` |
| Rows Updated | `innodb_row_ops.rows_updated` |
| Rows Deleted | `innodb_row_ops.rows_deleted` |

These are cumulative since server start. Compare read vs write ratios. A read-heavy workload with low row reads may indicate queries returning few results (good) or not using indexes (bad — cross-reference with table scan ratio).

### 4. Query Efficiency

| Metric | JSON Path | How to Interpret |
|--------|-----------|------------------|
| Temp Tables to Disk | `query_efficiency.tmp_disk_table_percent` | `XX%` (disk/total). > 10% = queries creating large temp results |
| Table Scan Ratio | `query_efficiency.table_scan_percent` | `XX%`. > 50% = most reads are full scans — missing indexes |
| Full Joins | `query_efficiency.select_full_join` | Warn if > 0. Joins without indexes — extremely expensive |
| Range Selects | `query_efficiency.select_range` | Index range scans (good). Higher is better relative to full scans |
| Sort Merge Passes | `query_efficiency.sort_merge_passes` | Warn if > 0. Sorts exceeding `sort_buffer_size` |

**This section is critical for identifying missing indexes.** If table scan ratio is high AND specific top queries show `no_index_used > 0`, you can give precise index recommendations.

### 5. InnoDB Buffer Pool

| Metric | JSON Path | How to Display |
|--------|-----------|----------------|
| Cache Hit Ratio | `innodb_buffer_pool.hit_ratio` | `XX.X%`. The most important single metric |
| Pool Usage | `innodb_buffer_pool.usage_percent` | `XX.X%` with `bytes_data / buffer_pool_size` as sub-value |
| Data | `innodb_buffer_pool.bytes_data` | Format as MB/GB |
| Dirty | `innodb_buffer_pool.bytes_dirty` | Format as MB/GB. Warn if significant |
| Free Pages | `innodb_buffer_pool.pages_free` | Format with K/M suffix |

**Analysis guidance:**
- Hit ratio < 99% + usage > 95% = buffer pool too small for the working set
- Hit ratio < 95% = severe cache pressure — increase `innodb_buffer_pool_size`
- Dirty pages are modified pages not yet flushed to disk — high dirty count means heavy writes or slow I/O

### 6. InnoDB I/O

| Metric | JSON Path |
|--------|-----------|
| Data Reads | `innodb_io.data_reads` |
| Data Writes | `innodb_io.data_writes` |

Only show this section if reads or writes > 0. High data reads with low buffer pool hit ratio = cache misses causing disk I/O.

### 7. Network

| Metric | JSON Path |
|--------|-----------|
| Bytes Received | `network.bytes_received` |
| Bytes Sent | `network.bytes_sent` |

Format as KB/MB/GB. High bytes sent relative to received suggests large result sets being returned.

### 8. Locks

| Metric | JSON Path | How to Interpret |
|--------|-----------|------------------|
| Row Lock Waits | `locks.row_lock_waits` | Warn if > 0. InnoDB row-level lock contention |
| Row Lock Time (ms) | `locks.row_lock_time` | Total time spent waiting for row locks |
| Table Lock Waits | `locks.table_locks_waited` | Warn if > 0. Table-level lock contention |
| Table Lock Contention | `locks.table_lock_contention` | `XX.X%` (waited / total). > 1% = investigate |

Lock contention + long-running queries in processlist = transactions holding locks too long. Check for MyISAM tables if table lock contention is high.

### 9. Table Cache

| Metric | JSON Path |
|--------|-----------|
| Open Tables | `table_cache.open_tables` |
| Opened Tables | `table_cache.opened_tables` |
| Cache Hit % | `table_cache.cache_hit_percent` |

Low cache hit = table_open_cache may be too small. Many opened_tables relative to open_tables means tables are being repeatedly opened and closed.

### 10. Top Queries (from performance_schema)

**This is the most actionable section.** Present as a table:

```
| Query | Calls | Avg Latency | Total Latency | Rows Examined | Rows Sent | Flags |
|-------|-------|-------------|---------------|---------------|-----------|-------|
| SELECT ... FROM orders WHERE... | 15.2K | 2.3ms | 35.1s | 1.2M | 15.2K | |
| SELECT ... FROM users JOIN... | 8.1K | 12.5ms | 101.3s | 890K | 8.1K | ! No Index |
```

**Per-query analysis:**
- `no_index_used > 0` → Flag with "! No Index" — these are the biggest optimization targets
- `tmp_disk_tables > 0` → Query creates on-disk temp tables — needs optimization
- High `rows_examined / rows_sent` ratio → Scanning many rows to return few — missing or suboptimal index
- Truncate query text to essential parts (tables, WHERE clauses, JOINs). Don't dump full ORM SQL.

**If `top_queries` is empty or null:** performance_schema is likely disabled — this is the default on Railway. Do not suggest enabling it without caveats: it requires ~400MB+ additional memory and is only advisable on larger instances. Just note that query-level data is unavailable.

### 11. Tables

```
| Table | Rows | Data | Indexes | Total |
|-------|------|------|---------|-------|
| orders | 1.2M | 450 MB | 120 MB | 570 MB |
| users | 50K | 12 MB | 8 MB | 20 MB |
```

Flag tables where index size is disproportionately large relative to data (possible unused indexes) or tables with many rows but no indexes (check with top queries).

### 12. Active Queries

Show if any non-Sleep, non-Daemon processes are running:

```
| User | Database | Command | Time (s) | Query |
|------|----------|---------|----------|-------|
| app | mydb | Query | 45 | SELECT ... |
```

Long-running queries (> 30s) warrant investigation. Cross-reference with lock waits — a long query may be holding locks that block others.

## MySQL Performance Patterns

**Buffer Pool Starvation Pattern:**
- Hit ratio < 99% + pool usage > 95% = buffer pool too small for working set
- High `Innodb_data_reads` confirms disk I/O from cache misses
- Fix: increase `innodb_buffer_pool_size` (target 70-80% of available RAM)

**Query Inefficiency Pattern:**
- Table scan ratio > 50% = most reads are full scans, missing indexes
- `Select_full_join` > 0 = joins without indexes, extremely expensive
- Temp tables to disk > 10% = sorts/groups exceeding `tmp_table_size`
- Top queries with `no_index_used > 0` = specific queries needing indexes

**Lock Contention Pattern:**
- `row_lock_waits` high + `row_lock_time` high = write contention
- Table lock contention > 1% = may have MyISAM tables or DDL locks
- Long-running queries in processlist holding locks

**Connection Pattern:**
- `connection_usage_percent > 70%` = approaching limit
- `aborted_clients > 0` = connections not being closed properly (app bug or timeout)
- `aborted_connects > 0` = authentication failures or connection limit hits

## MySQL Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Buffer pool hit ratio | > 99% | 95-99% | < 95% |
| Buffer pool usage | < 85% | 85-95% | > 95% |
| Connection usage | < 70% | 70-90% | > 90% |
| Temp tables to disk | < 10% | 10-25% | > 25% |
| Table scan ratio | < 50% | 50-75% | > 75% |
| Table lock contention | < 1% | 1-5% | > 5% |
| Full joins | 0 | 1-100 | > 100 |
| Sort merge passes | 0 | > 0 | — |

## MySQL Tuning Knowledge

| Parameter | Default | Target | What It Does |
|-----------|---------|--------|--------------|
| `innodb_buffer_pool_size` | 128MB | 70-80% RAM | InnoDB's main cache. Equivalent to PostgreSQL's shared_buffers but should be much larger (70-80% vs 25%). |
| `max_connections` | 151 | Based on load | Each connection uses memory. Over-provisioning wastes RAM. |
| `tmp_table_size` / `max_heap_table_size` | 16MB | 64-256MB | Max size for in-memory temp tables. Larger = fewer disk temp tables. Both must be set together. |
| `sort_buffer_size` | 256KB | 1-4MB | Per-connection sort buffer. Too large wastes memory (multiplied by connections). |
| `long_query_time` | 10s | 1-2s | Threshold for slow query log. Lower = more visibility but more log volume. |
| `table_open_cache` | 4000 | Based on tables | Number of open tables cached. Increase if `Opened_tables` grows rapidly. |

## MySQL-Specific Notes

- **`performance_schema=0` in start command** disables query-level metrics. This is the default on Railway. Note it when detected but do not recommend enabling it without caveats — it adds ~400MB+ memory overhead and is only practical on larger instances (2GB+ RAM).
- **`disable-log-bin` in start command** means no binary logging — point-in-time recovery is not possible. Note if relevant.
- **`innodb-use-native-aio=0`** is common on Railway (container filesystem limitation). Not a concern.
- **Cumulative counters**: All SHOW GLOBAL STATUS values are cumulative since server start. Use uptime to compute rates (e.g., questions/uptime = queries per second).

## Infrastructure (7d + 24h)

Show both windows side by side to compare trends:

**7-Day Trends**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.03 vCPU | 0.02 | 0.00 | 0.15 | stable |
| Memory | 480 MB | 460 MB | 420 MB | 510 MB | stable |
| Disk | 2.8 GB | 2.7 GB | 2.6 GB | 2.9 GB | increasing (+8%) |

**Last 24 Hours**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.05 vCPU | 0.03 | 0.00 | 0.15 | stable |
| Memory | 480 MB | 465 MB | 450 MB | 510 MB | stable |
| Disk | 2.8 GB | 2.78 GB | 2.75 GB | 2.81 GB | stable |

Compare windows to distinguish sustained vs transient trends.

Do NOT show cpu_limit/memory_limit columns or utilization %. Railway auto-scales — these limits are just the ceiling. See [analyze-db.md](analyze-db.md) autoscale rules.

## Validated against

- MySQL SHOW GLOBAL STATUS, SHOW VARIABLES, information_schema, performance_schema
