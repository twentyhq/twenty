# Database Analysis

## Your Role

You are a database performance expert. The script collects raw data - your job is to **think deeply** about what you see, identify root causes, correlate symptoms, and explain the "why" behind problems.

**Don't just report metrics. Analyze them.**

## Context Resolution

The user's request is the source of truth. Use this decision table:

| What the user provided | Action |
|------------------------|--------|
| Railway URL | Extract IDs directly from the URL — do NOT run `railway status --json` |
| Service name + environment name | Proceed — intent is clear. Resolve IDs via API. |
| Service name only (no environment) | Find the service by name via API. If multiple matches exist across projects, ask: "Which project do you mean?" Otherwise confirm: "Do you mean `<service>` in `<project>` / `<env>`?" — only proceed on confirmation |
| Raw UUID(s) | Resolve to human-readable names via API, then confirm before running |
| Vague request ("analyze my database", "check postgres") | Run `railway status --json` to see what's linked. If it's a database service, confirm: "Do you mean `<service>` in `<project>` / `<env>`?". If it's not a database service or nothing is linked, ask: "Which service and environment should I analyze?" |
| No context at all | List workspaces (`railway whoami --json`), then projects (`railway project list --json`), then environments and services for the chosen project, narrowing down until you have a specific service and environment |

`railway status --json` is a hint to form a specific question, not a trigger to act without confirmation.

**When the user provides a Railway URL**, extract IDs directly from it:

```
https://railway.com/project/<PROJECT_ID>/service/<SERVICE_ID>?environmentId=<ENV_ID>
https://railway.com/project/<PROJECT_ID>/service/<SERVICE_ID>/database?environmentId=<ENV_ID>
```

Then query the API for the service name and database type in a **single call**:

```bash
scripts/railway-api.sh \
  'query getServiceAndConfig($serviceId: String!, $environmentId: String!) {
    service(id: $serviceId) { name }
    environment(id: $environmentId) {
      config(decryptVariables: false)
    }
  }' \
  '{"serviceId": "<SERVICE_ID>", "environmentId": "<ENV_ID>"}'
```

From the response, get:
- **Service name**: `data.service.name`
- **Database image**: `data.environment.config.services.<SERVICE_ID>.source.image`

Then match the image to the database type:

| Image pattern | Database Type |
|--------------|---------------|
| `postgres*`, `ghcr.io/railway/postgres*` | PostgreSQL |
| `mysql*`, `ghcr.io/railway/mysql*` | MySQL |
| `redis*`, `ghcr.io/railway/redis*`, `railwayapp/redis*` | Redis |
| `mongo*`, `ghcr.io/railway/mongo*` | MongoDB |

**If `environmentId` is empty in the URL** (e.g., `?environmentId=` or no query param at all), skip the `environment.config` query — it requires a valid ID. Instead, list the project's environments:

```bash
scripts/railway-api.sh \
  'query getEnvs($id: String!) { project(id: $id) { environments { edges { node { id name } } } } }' \
  '{"id": "<PROJECT_ID>"}'
```

Use the `production` environment by default. If multiple non-PR environments exist and the user hasn't specified one, ask which environment to analyze.

## Database Type Detection and Script Selection

| Database Type | Script |
|---------------|--------|
| PostgreSQL | `scripts/analyze-postgres.py` |
| MySQL | `scripts/analyze-mysql.py` |
| Redis | `scripts/analyze-redis.py` |
| MongoDB | `scripts/analyze-mongo.py` |

**All scripts share the same CLI interface** (use the script name from the table above):
```bash
python3 scripts/analyze-<script>.py \
  --service <name> \
  --json \
  --project-id <project-id> \
  --environment-id <env-id> \
  --service-id <service-id>
```

Common options across all scripts:
- `--json` — JSON output for programmatic processing
- `--quiet` — Suppress progress messages
- `--skip-logs` — Skip log collection
- `--metrics-hours <N>` — Hours of metrics history (default: 24, max: 168)
- `--step <step>` — Debug individual collection steps (ssh-test, query, logs, metrics)

## Before You Analyze: Check Collection Status

**ALWAYS check `collection_status` and `errors[]` FIRST before interpreting any data.** The script collects data from multiple independent sources. Any of them can fail.

### Decision Table

| database_query | metrics_api | logs_api | Report Type |
|---------------|-------------|----------|-------------|
| success | success | success | Full analysis — use all sections |
| success | error | success | Full analysis — note missing infrastructure metrics |
| **error** | success | success | **Partial report** — only infrastructure metrics + log analysis. NO performance conclusions. |
| **error** | error | success | **Logs-only report** — state what logs show, note everything else failed. NO diagnosis. |
| **error** | **error** | **error** | **Collection failure** — report the errors, do not analyze. |

### When database_query failed — SSH key errors

If the error contains `"No SSH keys found"` or `"SSH key registration required"`, handle it proactively — don't just tell the user to fix it themselves.

**If error contains `"Key found but not registered"` or `"No SSH keys found"`:**

Run these two commands to understand what's available:

```bash
railway ssh keys          # list keys already registered with Railway
ls ~/.ssh/*.pub 2>/dev/null  # list local public keys
```

Then present the user with their options and ask which to use:

```
SSH introspection needs a registered key. Here's what I found:

Registered with Railway: <list from `railway ssh keys`, or "none">
Local keys available:    <list from ~/.ssh/*.pub, or "none">

Options:
  1. Register a local key — `railway ssh keys add` (uses your default key)
  2. Import from GitHub  — `railway ssh keys github`
  3. Generate a new key  — `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_railway`

Which would you like to do?
```

Once the user chooses and the key is registered, re-run the full analysis.

### When database_query failed — CLI outdated or missing

If the error contains `"--native SSH flag is not supported"` or `"Railway CLI not found"`, the script detected an unrecoverable CLI problem. Tell the user directly:

- **Outdated CLI:** "Your Railway CLI doesn't support native SSH. Update it: `npm i -g @railway/cli@latest` or `brew upgrade railway`"
- **Missing CLI:** "Railway CLI not installed. Install it: `npm i -g @railway/cli` or `brew install railway`"

Then ask if they'd like to proceed with a partial analysis (metrics + logs only) while they update, or wait until the CLI is fixed and re-run the full analysis.

### When database_query failed — other SSH errors

This means SSH could not reach the database or the query failed. You have NO connection stats, NO cache hit ratios, NO vacuum health, NO query performance data. All those fields will be null/empty.

**You MUST:**
1. State clearly: "Database introspection failed — SSH could not connect to the service"
2. Show the `collection_status` errors
3. Show only the data that DID succeed (metrics, logs)
4. Do NOT produce recommendations based on null metrics
5. Do NOT diagnose performance issues from logs alone

**Partial report template:**
```
Service: <name>
Status: Data collection partially failed

## Collection Status
| Source | Status |
|--------|--------|
| Database Query (SSH) | ERROR: <error from collection_status> |
| Metrics API | <status> |
| Logs API | <status> |

## Available Data
<Show metrics and log summary from sources that succeeded>

## What We Cannot Determine
<List what requires the database query: connection health, cache performance, vacuum health, query analysis, etc.>
```

## Output Structure: Data First, Actions Second

**Always present information in this order:**

### 1. Context Header
```
Service: <name> (<project> <environment>)
Status: <deployment health>, <RAM>, <disk used>
```

### 2. Consolidated Data Tables

Before any analysis, show the raw metrics in tables so the user sees their actual state. The DB-specific reference defines exactly which tables to show for each database type — present the relevant health sections first, then connections, then query performance.

**Logs & Active Issues:**
- Parse the `recent_logs` array (1000 lines of raw logs) - don't just check if empty
- Summarize: "Analyzed 1000 log lines: 3 errors (connection timeouts), 0 critical issues"
- Show specific concerning log entries if found
- **Categorize log entries**: group by type (errors, warnings, connection events, replication, crashes/restarts)
- **Count patterns**: note if a single type dominates the log output
- **Quote actual log lines** for errors — don't just say "errors found", show the exact message so the user can search their codebase

### 3. Analysis

After showing the data, explain the chain of causation. Connect the dots between tables.

### 4. Recommended Actions

Group by urgency. For databases that support configuration changes without restart vs those that require one, call that out explicitly.

### 5. Expected Outcomes

What metrics should change after fixes.

---

**Why this order matters:**
- Users can verify the data matches their understanding
- They see the full picture before being told what to do
- Actions have context - they know WHY each fix is recommended
- No valuable data is hidden in prose or omitted

## CRITICAL: Use the Actual Data

**NEVER fabricate or assume values.** The script outputs JSON with exact numbers. Before stating any metric:

1. **Read the actual JSON output** - Don't truncate or skim
2. **Quote the exact values** - e.g., `"max": 5000` not "100"
3. **Investigate outliers** - Dig into any field that seems unusually high or low

Common errors to avoid (all database types):
- **Not parsing `recent_logs`** - always analyze the raw log lines, don't just report "no errors"
- **Diagnosing performance issues from logs when all metrics are null** — logs show what happened, not how the database is performing
- **Treating startup/restart log entries as evidence of failure** — databases restart for many normal reasons (deploys, config changes, scaling)
- **Producing recommendations when all database metrics are null** — if `collection_status.database_query` is "error", you have no basis for tuning advice

See the DB-specific reference for additional errors to avoid per database type.

## Running the Analysis

Pass project, environment, and service IDs directly — no `railway link` needed:

```bash
# From plugins/railway/skills/use-railway directory:
# Use the script name from the "Database Type Detection" table above
python3 scripts/analyze-postgres.py --service <name> --json \
  --project-id <project-id> --environment-id <env-id> --service-id <service-id>
```

All three IDs come from the URL (see "Context: URL First" above). The service name comes from the API query.

**Options:**
- `--metrics-hours <N>` — Hours of metrics history to fetch (default: 24, max: 168). Use `--metrics-hours 168` for 7-day trends, `--metrics-hours 1` for recent snapshot.

**SSH retry:** The script automatically retries SSH connectivity up to 3 times with increasing timeouts (30s, 60s, 90s). Each individual SSH command (database query, slowlog, bigkeys, etc.) also retries up to 3 times on failure — covering transient errors like `exec request failed on channel 0`. Progress is logged to stderr.

**Output:** Progress messages go to stderr. JSON results go to stdout. Do not redirect or pipe stderr — just run the command as-is and read the full output.

### Resolving environment by name

If the URL has no `environmentId` and the user specifies an environment by name (e.g., "production"), resolve it:

```bash
scripts/railway-api.sh \
  'query getProject($id: String!) {
    project(id: $id) {
      environments { edges { node { id name } } }
    }
  }' \
  '{"id": "<PROJECT_ID>"}'
```

Match the environment name (case-insensitive) to get the `environmentId`.

### Debugging individual steps

```bash
# Use the script name from the "Database Type Detection" table above
python3 scripts/analyze-postgres.py --service <name> \
  --project-id <pid> --environment-id <eid> --service-id <sid> \
  --step ssh-test    # Test SSH connectivity
  --step query       # Run only the database query
  --step metrics     # Fetch only API metrics
  --step logs        # Fetch only logs
```

## Database-Specific References

After running the script and checking collection status, load the reference for the specific database type:

| Database | Reference | What It Covers |
|----------|-----------|----------------|
| PostgreSQL | [analyze-db-postgres.md](analyze-db-postgres.md) | What psql collects, log analysis checklist, tuning formulas, vacuum priority, pg_stat_statements, applying fixes |
| MySQL | [analyze-db-mysql.md](analyze-db-mysql.md) | All 12 metric sections (overview, query throughput, InnoDB, efficiency, buffer pool, I/O, network, locks, cache, top queries, tables, active queries), patterns, tuning |
| Redis | [analyze-db-redis.md](analyze-db-redis.md) | INFO ALL metrics, memory fragmentation, cache thrashing, persistence, command stats |
| MongoDB | [analyze-db-mongo.md](analyze-db-mongo.md) | serverStatus, WiredTiger cache, query efficiency, connection saturation, oplog |

**Always load the DB-specific reference** — it contains the metric sections, thresholds, and tuning knowledge needed for proper analysis.

## Infrastructure Metrics (All Database Types)

All scripts collect the same infrastructure metrics via Railway API:

**Metrics History (`metrics_history`):**
The script fetches **7 days** (168 hours) of time-series data from Railway's metrics API by default and produces **two analysis windows**:

```json
{
  "metrics_history": {
    "windows": {
      "7d": { "window_hours": 168, "metrics": { "cpu": {...}, "memory": {...}, ... } },
      "24h": { "window_hours": 24, "metrics": { "cpu": {...}, "memory": {...}, ... } }
    }
  }
}
```

Each window independently computes:
- **Summary stats**: current, min, max, avg for each metric
- **Trend analysis**: compares first-quarter avg to last-quarter avg — reports direction (increasing/decreasing/stable) and % change
- **Spike detection**: flags values > avg + 2*stddev with timestamps of peaks
- **Downsampled series**: ~48 data points per window

Available metrics: CPU, memory (with limits), disk, network RX/TX.

**Comparing windows reveals whether a trend is new or sustained:**
- "Memory increasing in 24h but stable over 7d" → temporary spike, likely a batch job
- "Memory increasing in both 24h AND 7d" → sustained growth, may need investigation
- "CPU spike in 24h, no spikes in 7d" → new issue
- "Disk growing over 7d" → data accumulation trend

Use `--metrics-hours N` to change the long window (default: 168, max: 168). The 24h window is always produced when the long window is > 24h.

### Railway auto-scales vertically

Railway services auto-scale CPU, RAM, and disk based on actual usage. Users do NOT pick or control resource sizes. The `cpu_limit` and `memory_limit` values from metrics are the **autoscale ceiling** (typically 32 vCPU / 32 GB), not user-provisioned allocations. Users are billed for actual usage, not the ceiling.

**Rules for ALL database types:**
- **Never say "right-size the instance"** or suggest reducing CPU/RAM — it's not a user action.
- **Never flag low utilization % against the limit as waste** — a service showing 0.01 vCPU / 70 MB actual usage against a 32 vCPU / 32 GB ceiling is normal, not over-provisioned.
- **Disk does NOT auto-scale** — Railway volumes have a fixed capacity. Paid users (Hobby and Pro) can expand them live without downtime, but it requires a manual resize. Flag high disk utilization as actionable. Users are billed for actual disk utilization, not the full volume size.
- **Focus on actual usage values**, not the ratio to limits. Analyze whether 70 MB of memory is healthy for this workload — don't compare it to the 32 GB ceiling.
- When tuning database parameters (shared_buffers, innodb_buffer_pool_size, maxmemory, etc.), base recommendations on the **current actual RAM** from `metrics_history.memory`, not the limit.
