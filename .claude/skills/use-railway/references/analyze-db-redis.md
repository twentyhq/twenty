# Redis Analysis

This reference covers Redis-specific metrics, tuning, and analysis guidance.
For common analysis patterns (output structure, collection status handling, performance thinking), see [analyze-db.md](analyze-db.md).

## What the Script Collects

**Via SSH (`INFO ALL`):**
- **Overview:** version, uptime, connected/blocked clients, rejected connections
- **Memory:** used/RSS/peak memory, fragmentation ratio, maxmemory, eviction policy
- **Throughput:** ops/sec, total commands processed, total connections
- **Cache Performance:** keyspace hits/misses, hit rate, expired/evicted keys
- **Persistence:** RDB last save time/status, AOF enabled/status
- **Command Stats:** per-command call count, avg latency, total time (sorted by calls)
- **Keyspace:** per-database key count, expires, avg TTL
- **Slow Log:** count via `SLOWLOG LEN` + actual entries via `SLOWLOG GET 20` (command, duration, timestamp)
- **Biggest Keys:** via `redis-cli --bigkeys` — runs **remotely over SSH** on the Railway service, not locally

**Via Railway API:** Same infrastructure metrics (disk, CPU, memory, network with **7d and 24h trends**).

## Presentation Template

Present Redis analysis using grouped stat cards that mirror the sections below. Each section is a labeled group with key-value stat cards. Flag values with status indicators (healthy/warning/critical) using the thresholds table.

### Full Report (SSH + Metrics + Logs all succeeded)

**Overview**
| Version | Uptime | Connected Clients | Blocked Clients | Rejected Connections | Total Keys |
|---------|--------|-------------------|-----------------|----------------------|------------|
| 7.2.4 | 14d 6h | 23 | 0 | 0 | 48,291 |

Flag: blocked clients > 0 = warning, rejected connections > 0 = critical.

**Memory**
| Used Memory | RSS Memory | Peak Memory | Fragmentation Ratio | Max Memory | Eviction Policy |
|-------------|------------|-------------|---------------------|------------|-----------------|
| 12.4 MB | 18.2 MB | 15.1 MB | 1.47 | Unlimited | noeviction |

Flag: fragmentation > 1.5 = warning, > 2.0 or < 1.0 = critical. Evicted keys > 0 with noeviction = problem.

**Throughput**
| Ops/sec | Total Commands | Total Connections | Slow Log Entries |
|---------|----------------|-------------------|------------------|
| 1,240 | 8.4M | 12,491 | 3 |

Flag: slow log > 100 = warning.

**Cache Performance**
| Hit Rate | Hits | Misses | Expired Keys | Evicted Keys |
|----------|------|--------|--------------|--------------|
| 97.2% | 6.1M | 178K | 892K | 0 |

Flag: hit rate >= 95% = healthy, 80-95% = warning, < 80% = critical. Evicted > 0 = warning.

**Persistence**
| RDB Last Save | RDB Status | AOF Enabled | AOF Rewrite Status |
|---------------|------------|-------------|-------------------|
| 2 min ago | ok | Yes | ok |

Flag: RDB status != ok = critical. AOF rewrite status != ok = critical.

**Command Stats** (top 20 by calls)
| Command | Calls | Avg Latency | Total Time |
|---------|-------|-------------|------------|
| GET | 4.2M | 3.1µs | 13.0s |
| SET | 2.1M | 4.8µs | 10.1s |
| HGET | 890K | 5.2µs | 4.6s |
| EXPIRE | 620K | 2.1µs | 1.3s |

**Slow Log Entries** (if collected — up to 20 most recent)
| # | Timestamp | Duration | Command |
|---|-----------|----------|---------|
| 1 | 2m ago | 12.3ms | GET user:session:abc123... |
| 2 | 5m ago | 10.1ms | GET cache:render:page/home... |
| 3 | 12m ago | 8.7ms | HGETALL product:catalog:main |

Analysis: correlate slow commands with command stats and big keys. If slowlog shows GET and bigkeys shows large strings, the diagnosis is "large values causing high GET latency" — confirmed without user intervention.

**Biggest Keys** (if collected — one per type)
| Type | Key | Size/Count |
|------|-----|------------|
| string | cache:render:page/dashboard | 2.1 MB |
| hash | user:sessions | 14,291 fields |
| list | queue:notifications | 8,402 items |

Analysis: large keys cause latency spikes on read/write/delete. Cross-reference with slowlog — if the slow commands target these keys, that's the root cause. If bigkeys shows nothing large (all < 1KB), latency issues are likely volume-driven, not value-size-driven.

**Keyspace**
| Database | Keys | Expires | Avg TTL |
|----------|------|---------|---------|
| db0 | 48,291 | 31,204 | 2.4h |

**Infrastructure (7d + 24h)** — show both windows so trends can be compared:

**7-Day Trends**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.01 vCPU | 0.01 | 0.00 | 0.10 | stable |
| Memory | 70 MB | 40 MB | 30 MB | 90 MB | stable |
| Disk | 1.1 GB | 1.11 GB | 1.07 GB | 1.16 GB | stable |

**Last 24 Hours**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.01 vCPU | 0.01 | 0.00 | 0.07 | stable |
| Memory | 70 MB | 55 MB | 30 MB | 90 MB | increasing (+58%) |
| Disk | 1.1 GB | 1.11 GB | 1.07 GB | 1.16 GB | stable |

Compare: "Memory increasing in 24h but stable over 7d → temporary spike, not a sustained trend."

Do NOT show cpu_limit/memory_limit columns or utilization %. Railway auto-scales — these limits are just the ceiling. See [analyze-db.md](analyze-db.md) autoscale rules.

### Partial Report (Introspection failed, only Metrics + Logs)

When introspection fails, you have NO Redis INFO data — all overview, memory, throughput, cache, persistence, command stats, and keyspace fields will be null/empty.

**NEVER suggest running `redis-cli` without pointing to the remote Railway service host.** There is no local Redis instance — all redis-cli commands must target the Railway service. If you cannot connect, the fix is to restore remote access (see `analyze-db.md`), not to run commands locally.

**You MUST:**
1. State clearly: "Redis introspection failed — could not connect to the service"
2. Show collection status errors
3. Show ONLY infrastructure metrics and log analysis — do not show empty stat card sections
4. Do NOT produce recommendations based on null Redis metrics

**Show the infrastructure table** (same as full report).

**Analyze logs thoroughly:**
- AOF rewrite frequency and growth % triggers
- fsync warnings ("disk is busy?")
- OOM warnings
- Connection errors
- Startup/restart events (note these are normal during deploys)
- Summarize with counts: "Analyzed 1000 lines: 18 AOF rewrites, 1 fsync warning, 0 errors"

**State what you cannot determine** without SSH:
- Connection health (clients, blocked, rejected)
- Memory usage and fragmentation
- Cache hit rate
- Eviction status
- Command workload profile
- Keyspace composition
- Slow log entries and actual slow commands
- Biggest keys per type

## Redis Performance Patterns

**Memory Fragmentation Pattern:**
- `mem_fragmentation_ratio > 1.5` = memory is fragmented, RSS much higher than used
- Caused by frequent small key deletions creating memory holes
- Fix: restart Redis, or enable `activedefrag yes` (Redis 4.0+)
- Ratio < 1.0 means Redis is using swap — critical performance issue

**Cache Thrashing Pattern:**
- Hit rate < 80% + evicted keys > 0 = working set exceeds maxmemory
- Check maxmemory_policy — `noeviction` will reject writes, `allkeys-lru` will evict
- If maxmemory is 0 (unlimited), Redis will consume all RAM until OOM killed

**Connection Rejection Pattern:**
- rejected_connections > 0 = maxclients limit hit
- Check connected_clients vs maxclients default (10,000)
- Blocked clients = operations waiting on BLPOP/BRPOP/WAIT

**Persistence Risk Pattern:**
- RDB last save failed + no AOF = data loss risk on restart
- Check disk space if saves are failing
- Long time since last save = more data at risk

**AOF Rewrite Churn Pattern:**
- Frequent AOF rewrites (every 1-2 hours) with high growth % triggers (100-800%)
- Indicates high write-to-data-size ratio — small dataset with heavy writes
- Check Fork CoW size to gauge actual data size vs AOF overhead
- If rewrites are fast (<1s) and CoW is small (<10 MB), this is noisy but harmless
- If rewrites are slow or CoW is large, investigate write patterns

**Disk Sawtooth Pattern:**
- Disk usage oscillating in a regular pattern = AOF growing between rewrites, then compacting
- Normal behavior — the baseline is volume overhead + AOF base file
- If the amplitude is growing over time, data size is increasing

## Redis Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Hit rate | >95% | 80-95% | <80% |
| Fragmentation ratio | 1.0-1.5 | 1.5-2.0 | >2.0 or <1.0 |
| Evicted keys | 0 | >0 | Growing rapidly |
| Blocked clients | 0 | 1-5 | >5 |
| Connected clients | <80% maxclients | 80-90% | >90% |

## Redis Command Stats Analysis

The top commands by call count reveal the workload pattern:
- **GET/SET dominant** = simple key-value cache
- **HGET/HSET dominant** = hash-based data model (sessions, objects)
- **LPUSH/RPOP dominant** = queue pattern
- **High KEYS/SCAN** = application iterating keys (potential performance issue at scale)
- **High latency on simple commands** (>100µs for GET) = memory pressure or CPU saturation

## Redis Autoscale Note

See [analyze-db.md](analyze-db.md) for full autoscale rules. For Redis specifically:
- If `maxmemory` is set, compare it against actual memory usage — not the Railway memory limit.
- If `maxmemory` is 0 (unlimited), Redis will grow until the OS kills it. This is the default Railway config and works fine with autoscaling — Redis uses what it needs and Railway scales the container.
- Do NOT recommend setting maxmemory to a fraction of the Railway memory limit — the limit is the autoscale ceiling, not fixed allocation.

## Validated against

- Redis INFO command, SLOWLOG LEN, SLOWLOG GET, and --bigkeys
