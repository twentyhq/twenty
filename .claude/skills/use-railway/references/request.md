# Request

Official documentation and community endpoints. GraphQL operations for things the CLI doesn't expose.

## Official documentation

Primary sources for authoritative Railway information:

- **Full LLM docs**: `https://docs.railway.com/api/llms-docs.md`
- **LLM summary**: `https://railway.com/llms.txt`
- **Templates**: `https://railway.com/llms-templates.md`
- **Changelog**: `https://railway.com/llms-changelog.md`
- **Blog**: `https://blog.railway.com/llms-blog.md`
- **Direct doc pages**: `https://docs.railway.com/<path>` (for example, `cli/up`, `networking/domains`, `observability/logs`)

Tip: append `.md` to any `docs.railway.com` page URL to get a markdown version suitable for LLM consumption.

Common doc paths:

| Topic | Path |
|---|---|
| Projects | `guides/projects` |
| Deployments | `guides/deployments` |
| Volumes | `guides/volumes` |
| Variables | `guides/variables` |
| CLI reference | `reference/cli-api` |
| Pricing | `reference/pricing` |
| Public networking | `networking/public-networking` |
| Private networking | `networking/private-networking` |

Fetch official docs first for product behavior questions. Use Central Station only when you need community evidence, prior incidents, or implementation anecdotes.


## Central Station (community)

Search and browse Railway's community platform for prior discussions, issue patterns, and field solutions.

### Recent threads

```bash
curl -s 'https://station-server.railway.com/gql' \
  -H 'content-type: application/json' \
  -d '{"query":"{ threads(first: 10, sort: recent_activity) { edges { node { slug subject status upvoteCount createdAt topic { slug displayName } } } } }"}'
```

Filter by topic with the `topic` parameter (`"questions"`, `"feedback"`, `"community"`, `"billing"`):

```bash
curl -s 'https://station-server.railway.com/gql' \
  -H 'content-type: application/json' \
  -d '{"query":"{ threads(first: 10, sort: recent_activity, topic: \"questions\") { edges { node { slug subject status topic { displayName } upvoteCount } } } }"}'
```

Sort options: `recent_activity` (default), `newest`, `highest_votes`.

### Search threads

```bash
curl -s 'https://station-server.railway.com/gql' \
  -H 'content-type: application/json' \
  -d '{"query":"{ threads(first: 10, search: \"<search-term>\") { edges { node { slug subject status } } } }"}'
```

### LLM data export

Bulk search alternative — fetches all public threads with full content:

```bash
curl -s 'https://station-server.railway.com/api/llms-station'
```

### Read a full thread

```bash
curl -s 'https://station-server.railway.com/api/threads/<slug>?format=md'
```

Thread URLs follow the format: `https://station.railway.com/{topic_slug}/{thread_slug}`

Community threads are anecdotal. Always pair with official docs when the answer informs an operational decision.


## GraphQL helper

All GraphQL operations use the API helper script, which handles authentication automatically:

```bash
scripts/railway-api.sh '<query>' '<variables-json>'
```

The script reads the API token from `~/.railway/config.json` and sends requests to `https://backboard.railway.com/graphql/v2`.

For the full API schema, see: https://docs.railway.com/api/llms-docs.md

## Project mutations

The CLI doesn't expose project setting updates (rename, PR deploys, visibility). Use GraphQL:

```bash
scripts/railway-api.sh \
  'mutation updateProject($id: String!, $input: ProjectUpdateInput!) {
    projectUpdate(id: $id, input: $input) { id name isPublic prDeploys botPrEnvironments }
  }' \
  '{"id":"<project-id>","input":{"name":"new-name","prDeploys":true}}'
```

Common `ProjectUpdateInput` fields: `name`, `isPublic`, `prDeploys`, `botPrEnvironments`.


## Service mutations

The CLI can create services (`railway add`) but cannot rename them or change icons. Use GraphQL:

```bash
scripts/railway-api.sh \
  'mutation updateService($id: String!, $input: ServiceUpdateInput!) {
    serviceUpdate(id: $id, input: $input) { id name icon }
  }' \
  '{"id":"<service-id>","input":{"name":"new-name"}}'
```

`ServiceUpdateInput` fields: `name`, `icon` (image URL, animated GIF, or devicons URL like `https://devicons.railway.app/postgres`).

Get the service ID from `railway status --json`.


## Service creation via GraphQL

Prefer `railway add` for most cases. Use GraphQL for programmatic or advanced use:

```bash
scripts/railway-api.sh \
  'mutation createService($input: ServiceCreateInput!) {
    serviceCreate(input: $input) { id name }
  }' \
  '{"input":{"projectId":"<project-id>","name":"my-service","source":{"image":"nginx:latest"}}}'
```

`ServiceCreateInput` fields:

| Field | Type | Description |
|---|---|---|
| `projectId` | String! | Target project (required) |
| `name` | String | Service name (auto-generated if omitted) |
| `source.image` | String | Docker image (for example, `nginx:latest`) |
| `source.repo` | String | GitHub repo (for example, `user/repo`) |
| `branch` | String | Git branch for repo source |
| `environmentId` | String | Create only in a specific environment |

After creating a service via GraphQL, configure it with a JSON config patch including `isCreated: true` (see [configure.md](configure.md)).


## Metrics queries

Resource usage metrics are only available via GraphQL:

```bash
scripts/railway-api.sh \
  'query metrics($environmentId: String!, $serviceId: String, $startDate: DateTime!, $endDate: DateTime, $sampleRateSeconds: Int, $averagingWindowSeconds: Int, $groupBy: [MetricTag!], $measurements: [MetricMeasurement!]!) {
    metrics(environmentId: $environmentId, serviceId: $serviceId, startDate: $startDate, endDate: $endDate, sampleRateSeconds: $sampleRateSeconds, averagingWindowSeconds: $averagingWindowSeconds, groupBy: $groupBy, measurements: $measurements) {
      measurement tags { serviceId deploymentId region } values { ts value }
    }
  }' \
  '{"environmentId":"<env-id>","serviceId":"<service-id>","startDate":"2026-02-19T00:00:00Z","measurements":["CPU_USAGE","MEMORY_USAGE_GB"]}'
```

Available `MetricMeasurement` values: `CPU_USAGE`, `CPU_LIMIT`, `MEMORY_USAGE_GB`, `MEMORY_LIMIT_GB`, `NETWORK_RX_GB`, `NETWORK_TX_GB`, `DISK_USAGE_GB`, `EPHEMERAL_DISK_USAGE_GB`, `BACKUP_USAGE_GB`.

Optional parameters: `endDate` (defaults to now), `sampleRateSeconds`, `averagingWindowSeconds`. Use `groupBy: ["SERVICE_ID"]` without `serviceId` to query all services in an environment at once. Valid `MetricTag` values for `groupBy`: `SERVICE_ID`, `DEPLOYMENT_ID`, `DEPLOYMENT_INSTANCE_ID`, `REGION`.

Get environment and service IDs from `railway status --json`.

## Template search

Search Railway's template marketplace:

```bash
scripts/railway-api.sh \
  'query templates($query: String!, $verified: Boolean, $recommended: Boolean) {
    templates(query: $query, verified: $verified, recommended: $recommended) {
      edges { node { code name description category } }
    }
  }' \
  '{"query":"redis","verified":true}'
```

| Parameter | Type | Description |
|---|---|---|
| `query` | String | Search term |
| `verified` | Boolean | Only verified templates |
| `recommended` | Boolean | Only recommended templates |
| `first` | Int | Number of results (max ~100) |

Common template codes: `ghost`, `strapi`, `minio`, `n8n`, `uptime-kuma`, `umami`, `postgres`, `redis`, `mysql`, `mongodb`.

Deploy a found template via CLI:

```bash
railway deploy --template <template-code>
```

### GraphQL template deployment

For deploying into a specific environment or tracking the workflow, use the two-step GraphQL flow:

**Step 1** — Fetch the template config:

```bash
scripts/railway-api.sh \
  'query template($code: String!) {
    template(code: $code) { id serializedConfig }
  }' \
  '{"code":"postgres"}'
```

**Step 2** — Deploy with `templateDeployV2`:

```bash
scripts/railway-api.sh \
  'mutation deploy($input: TemplateDeployV2Input!) {
    templateDeployV2(input: $input) { projectId workflowId }
  }' \
  '{"input":{
    "templateId":"<id-from-step-1>",
    "serializedConfig":<config-object-from-step-1>,
    "projectId":"<project-id>",
    "environmentId":"<env-id>",
    "workspaceId":"<workspace-id>"
  }}'
```

`serializedConfig` is the raw JSON object from the template query, not a string. Get `workspaceId` via `scripts/railway-api.sh 'query { project(id: "<project-id>") { workspaceId } }' '{}'`.


## Validated against

- Docs: [api docs](https://docs.railway.com/api/llms-docs.md), [community.md](https://docs.railway.com/community), [cli/docs.md](https://docs.railway.com/cli/docs)
- CLI source: [docs.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/docs.rs)
