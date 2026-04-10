# Operate

Check health, read logs, query metrics, and troubleshoot failures.

## Health snapshot

Start broad, then narrow:

```bash
railway status --json                                    # linked context
railway service status --all --json                      # all services, deployment states
railway deployment list --limit 10 --json                # recent deployments
```

Deployment statuses: `SUCCESS`, `BUILDING`, `DEPLOYING`, `FAILED`, `CRASHED`, `REMOVED`.

For projects with buckets, include bucket status:

```bash
railway bucket list --json                                       # buckets in current environment
railway bucket info --bucket <name> --json                       # storage size, object count, region
```

If everything looks healthy, return a summary and stop. If something is degraded or failing, continue to log inspection.

## Logs

### Recent logs

```bash
railway logs --service <service> --lines 200 --json              # runtime logs
railway logs --service <service> --build --lines 200 --json      # build logs
railway logs --latest --lines 200 --json                         # latest deployment
```

`railway logs` streams indefinitely when no bounding flags are given. Always use `--lines`, `--since`, or `--until` to get a bounded fetch. Open streams block execution.

### Time-bounded queries

```bash
railway logs --service <service> --since 1h --lines 400 --json
railway logs --service <service> --since 30m --until 10m --lines 400 --json
```

### Filtered queries

Use `--filter` to narrow logs without scanning everything manually:

```bash
railway logs --service <service> --lines 200 --filter "@level:error" --json
railway logs --service <service> --lines 200 --filter "@level:warn AND timeout" --json
railway logs --service <service> --lines 200 --filter "connection refused" --json
```

Filter syntax supports text search (`"error message"`), attribute filters (`@level:error`, `@level:warn`), and boolean operators (`AND`, `OR`, `-` for negation). Full syntax: https://docs.railway.com/guides/logs

### Scoped by environment

```bash
railway logs --service <service> --environment <env> --lines 200 --json
```

## Metrics

Resource usage metrics (CPU, memory, network, disk) are only available through the GraphQL API:

```bash
scripts/railway-api.sh \
  'query metrics($environmentId: String!, $serviceId: String, $startDate: DateTime!, $groupBy: [MetricTag!], $measurements: [MetricMeasurement!]!) {
    metrics(environmentId: $environmentId, serviceId: $serviceId, startDate: $startDate, groupBy: $groupBy, measurements: $measurements) {
      measurement tags { serviceId deploymentId region } values { ts value }
    }
  }' \
  '{"environmentId":"<env-id>","serviceId":"<service-id>","startDate":"2026-02-19T00:00:00Z","measurements":["CPU_USAGE","MEMORY_USAGE_GB"]}'
```

Available measurements: `CPU_USAGE`, `CPU_LIMIT`, `MEMORY_USAGE_GB`, `MEMORY_LIMIT_GB`, `NETWORK_RX_GB`, `NETWORK_TX_GB`, `DISK_USAGE_GB`, `EPHEMERAL_DISK_USAGE_GB`, `BACKUP_USAGE_GB`.

Omit `serviceId` and add `"groupBy": ["SERVICE_ID"]` to query all services in the environment at once. Get the environment and service IDs from `railway status --json`.

## Failure triage

When something is broken, classify the failure first. The fix depends on the class.

### Build failures

The service failed to build. Look at build logs:

```bash
railway logs --latest --build --lines 400 --json
```

Common causes and fixes:
- **Missing dependencies**: check lockfiles, verify package manager detection
- **Wrong build command**: override with `railway environment edit --service-config <service> build.buildCommand "<command>"`
- **Builder mismatch**: switch builders with `railway environment edit --service-config <service> build.builder RAILPACK`
- **Wrong root directory** (monorepo): set `source.rootDirectory` to the correct package path

### Runtime failures

The build succeeded but the service crashes or misbehaves:

```bash
railway logs --latest --lines 400 --json
railway logs --service <service> --since 1h --lines 400 --json
```

Common causes and fixes:
- **Bad start command**: override with `railway environment edit --service-config <service> deploy.startCommand "<command>"`
- **Missing runtime variable**: check `railway variable list --service <service> --json` and set missing values
- **Port mismatch**: the service must listen on `$PORT` (Railway injects this). Verify with logs.
- **Upstream dependency down**: check other services' status and logs

### Config-driven failures

Something worked before and broke after a config change:

```bash
railway environment config --json
railway variable list --service <service> --json
```

Compare the config against expected values. Look for changes that may have introduced the regression.

### Networking failures

Domain returns errors, or service-to-service calls fail:

```bash
railway domain --service <service> --json
railway logs --service <service> --lines 200 --json
```

Check: target port matches what the service listens on, domain status is healthy, private domain variable references are correct.

## Recovery

After identifying the cause, fix and verify:

```bash
# Fix (examples)
railway environment edit --service-config <service> deploy.startCommand "<correct-command>"
railway variable set MISSING_VAR=value --service <service>

# Redeploy
railway redeploy --service <service> --yes

# Verify
railway service status --service <service> --json
railway logs --service <service> --lines 200 --json
```

Always verify after fixing. Don't assume the redeploy succeeded.

## Troubleshoot common blockers

- **Unlinked context**: `railway link --project <id-or-name>`
- **Missing service scope for logs**: pass `--service` and `--environment` explicitly
- **No deployments found**: the service exists but has never deployed, create an initial deploy first
- **Metrics query returns empty**: verify IDs from `railway status --json` and check the time window
- **Config patch type error**: check the typed paths in [configure.md](configure.md), for example, `numReplicas` is an integer, not a string

## Validated against

- Docs: [status.md](https://docs.railway.com/cli/status), [logs.md](https://docs.railway.com/cli/logs), [observability.md](https://docs.railway.com/observability), [observability/logs.md](https://docs.railway.com/observability/logs), [observability/metrics.md](https://docs.railway.com/observability/metrics)
- CLI source: [status.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/status.rs), [logs.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/logs.rs), [deployment.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/deployment.rs), [redeploy.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/redeploy.rs)
