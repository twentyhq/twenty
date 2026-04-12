# MongoDB Analysis

This reference covers MongoDB-specific metrics, tuning, and analysis guidance.
For common analysis patterns (output structure, collection status handling, performance thinking), see [analyze-db.md](analyze-db.md).

### What the Script Collects

**Via SSH (mongosh):**
- **Server Status:** version, storage engine, uptime, connections, opcounters, latency, memory, network, WiredTiger cache/checkpoint/tickets, global lock queues, document operations, query efficiency, cursors, TTL, asserts
- **DB Stats:** dataSize, storageSize, indexSize, object count, collection count
- **Collection Stats:** per-collection document count, size, storage size, index size, index count
- **Current Operations:** active ops with type, namespace, duration
- **Slow Queries:** from system.profile (if profiling enabled) — op, namespace, duration, plan summary
- **Replication Info:** oplog size, usage, time window
- **Top Collections:** per-collection read/write counts and time from `top` admin command

**Via Railway API:** Same infrastructure metrics.

### MongoDB Performance Patterns

**WiredTiger Cache Pressure Pattern:**
- Cache usage > 80% + app thread evictions > 0 = cache too small for working set
- Dirty cache > 20% of total = checkpoint falling behind, writes accumulating
- Read/write tickets depleted = operations queueing at storage engine level
- Fix: increase service RAM (WiredTiger uses ~50% of available RAM for cache)

**Query Efficiency Pattern:**
- `scannedObjects >> docsReturned` = collection scans, missing indexes
- Plan cache misses >> hits = frequent query re-planning, add indexes
- Sort spill to disk > 0 = sorts exceeding 100MB memory limit, needs index

**Connection Saturation Pattern:**
- `connectionsCurrent` approaching `connectionsAvailable` = connection pool exhaustion
- Many active ops with high microsecs_running = slow queries holding connections
- Queued readers/writers > 0 = global lock contention

**Oplog Pressure Pattern:**
- Oplog usage > 80% = replication window shrinking
- High write rate + small oplog = replicas may fall out of sync
- timeDiffHours < 1 on busy systems = risk of replica resync

### MongoDB Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| WT cache usage | <70% | 70-85% | >85% |
| WT dirty % | <5% | 5-20% | >20% |
| App thread evictions | 0 | 1-100 | >100 |
| Connection usage | <70% | 70-85% | >85% |
| Queued operations | 0 | 1-10 | >10 |
| Scan-to-return ratio | <2x | 2-10x | >10x |

## Infrastructure (7d + 24h)

Show both windows side by side to compare trends:

**7-Day Trends**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.02 vCPU | 0.02 | 0.00 | 0.12 | stable |
| Memory | 210 MB | 200 MB | 180 MB | 240 MB | stable |
| Disk | 1.5 GB | 1.48 GB | 1.42 GB | 1.55 GB | increasing (+6%) |

**Last 24 Hours**
| Metric | Current | Avg | Min | Max | Trend |
|--------|---------|-----|-----|-----|-------|
| CPU | 0.03 vCPU | 0.02 | 0.00 | 0.12 | stable |
| Memory | 210 MB | 205 MB | 195 MB | 240 MB | stable |
| Disk | 1.5 GB | 1.49 GB | 1.48 GB | 1.51 GB | stable |

Compare windows to distinguish sustained vs transient trends.

Do NOT show cpu_limit/memory_limit columns or utilization %. Railway auto-scales — these limits are just the ceiling. See [analyze-db.md](analyze-db.md) autoscale rules.

## MongoDB Autoscale Note

See [analyze-db.md](analyze-db.md) for full autoscale rules. For MongoDB specifically:
- WiredTiger uses ~50% of available RAM for cache by default. As Railway auto-scales the container, the cache ceiling grows automatically.
- Do NOT recommend limiting WiredTiger cache to a fraction of the Railway memory limit — the limit is the autoscale ceiling, not fixed allocation.
- If cache usage is consistently >80%, this indicates working set pressure — note it but do not tell the user to increase RAM manually.

## Validated against

- MongoDB serverStatus, db.stats(), system.profile, top admin command
