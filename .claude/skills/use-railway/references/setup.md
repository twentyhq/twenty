# Setup

Create, link, and organize Railway projects, services, databases, and workspaces.

## Projects

### List and discover

```bash
railway project list --json        # projects in current workspace
railway list --json                # all projects across workspaces with service metadata
railway whoami --json              # current user, workspace memberships
```

### Link to an existing project

Linking sets the working context for all subsequent CLI commands in this directory.

```bash
railway link --project <project-id-or-name>
railway status --json              # confirm linked context
```

Without `--project`, `railway link` runs interactively. For scripted or CI use, always pass explicit flags.

### Link to a specific service

Switch the linked service within an already-linked project:

```bash
railway service link              # interactive service picker
railway service link <name>       # link directly by name
```

### Create a new project

```bash
railway init --name <project-name>
railway init --name <project-name> --workspace <workspace-id-or-name>
```

`railway init` both creates and links in one step. In CI or multi-workspace setups, pass `--workspace` explicitly to avoid ambiguity.

### Update project settings

Settings like project name, PR deploys, and visibility aren't exposed through the CLI. Use the GraphQL API helper (see [request.md](request.md)):

```bash
scripts/railway-api.sh \
  'mutation updateProject($id: String!, $input: ProjectUpdateInput!) {
    projectUpdate(id: $id, input: $input) { id name isPublic prDeploys }
  }' \
  '{"id":"<project-id>","input":{"name":"new-name","prDeploys":true}}'
```

## Services

### Create a service

```bash
railway add --service <service-name>          # empty service
railway add --database postgres               # managed database (postgres, redis, mysql, mongodb)
railway add                                   # interactive, prompts for type
```

Before adding a database, check for existing database services to avoid duplicates. Run `railway environment config --json` and inspect `source.image` for each service:

| Image pattern | Database |
|---|---|
| `ghcr.io/railway/postgres*` or `postgres:*` | Postgres |
| `ghcr.io/railway/redis*` or `redis:*` | Redis |
| `ghcr.io/railway/mysql*` or `mysql:*` | MySQL |
| `ghcr.io/railway/mongo*` or `mongo:*` | MongoDB |

If a matching database already exists, skip creation and wire the existing service's variables to the app.

Empty services have no source until you configure one. This is the right pattern when you need to set source repo, branch, or build config before the first deploy.

### Connect a database to a service

After `railway add --database <type>`, the database creates connection variables automatically. Wire them to your app service using variable references:

| Database | Connection variable |
|---|---|
| Postgres | `${{Postgres.DATABASE_URL}}` |
| Redis | `${{Redis.REDIS_URL}}` |
| MySQL | `${{MySQL.MYSQL_URL}}` |
| MongoDB | `${{MongoDB.MONGO_URL}}` |

```bash
railway variable set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service <app-service>
```

Service names in variable references are case-sensitive and must match exactly. For full wiring details including public/private networking decisions, see [configure.md](configure.md).

When creating new service instances via JSON config patches, include `isCreated: true` in the service block to mark it as a new service.

### Deploy from a template

Templates provision pre-configured services with sensible defaults, faster than creating an empty service and configuring it manually:

```bash
railway deploy --template <template-code>
```

Common template codes: `postgres`, `redis`, `mysql`, `mongodb`, `minio`, `umami`. For the full list, search via the GraphQL API (see [request.md](request.md)).

Template deployments typically create:

- A service with pre-configured image or source
- Environment variables (connection strings, secrets)
- A volume for persistent data (databases)
- A TCP proxy for external access (where applicable)

### Bootstrap source for an empty service

After creating an empty service, wire it to a repo:

```bash
railway environment edit --service-config <service> source.repo <repo-url>
railway environment edit --service-config <service> source.branch <branch>
```

### Deploy a Docker image

When you have a built image (for example, from a private registry or Docker Hub), skip source builds entirely:

```bash
railway environment edit --service-config <service> source.image <image:tag>
```

This sets the service to pull from a container registry instead of building from source.

## Buckets

Buckets are S3-compatible object storage. They are created at the project level and deployed to environments via config patches.

### List buckets

```bash
railway bucket list --json                                # buckets in current environment
railway bucket list --environment production --json       # buckets in a specific environment
```

### Create a bucket

```bash
railway bucket create my-bucket --region sjc              # create with name and region
railway bucket create --region iad --json                 # auto-named, JSON output
```

Available regions:

| Code | Location |
|---|---|
| `sjc` | US West (California) |
| `iad` | US East (Virginia) |
| `ams` | EU West (Amsterdam) |
| `sin` | Asia Pacific (Singapore) |

Without `--region`, the CLI prompts interactively. For scripted use, always pass `--region`.

### Delete a bucket

Deletion is permanent and destroys all objects in the bucket.

```bash
railway bucket delete --bucket my-bucket --yes            # non-interactive
railway bucket delete --bucket my-bucket --yes --2fa-code 123456   # with 2FA
```

### Rename a bucket

```bash
railway bucket rename --bucket my-bucket --name new-name --json
```

### Bucket info

Check storage usage and object count:

```bash
railway bucket info --bucket my-bucket --json
```

Returns storage size (bytes), object count, region, and environment.

### Bucket credentials

Get S3-compatible credentials for connecting your app to a bucket:

```bash
railway bucket credentials --bucket my-bucket --json
```

Returns: `endpoint`, `accessKeyId`, `secretAccessKey`, `bucketName`, `region`, `urlStyle`.

Without `--json`, output uses `AWS_*=value` lines suitable for `eval $(railway bucket credentials)` or piping into `.env` files.

To reset credentials (invalidates existing ones):

```bash
railway bucket credentials --bucket my-bucket --reset --yes
railway bucket credentials --bucket my-bucket --reset --yes --2fa-code 123456  # with 2FA
```

### Connect a bucket to a service

After creating a bucket, wire the S3 credentials to your app service as environment variables:

```bash
# Get credentials
railway bucket credentials --bucket my-bucket --json

# Set them on your app service
railway variable set \
  AWS_ENDPOINT_URL=<endpoint> \
  AWS_ACCESS_KEY_ID=<access-key> \
  AWS_SECRET_ACCESS_KEY=<secret-key> \
  AWS_S3_BUCKET_NAME=<bucket-name> \
  AWS_DEFAULT_REGION=<region> \
  --service <app-service>
```

All subcommands support `--bucket (-b)` and `--environment (-e)` as global flags to skip interactive prompts.

## Analyze codebase before setup

When setting up a new service from source, detect the project type from marker files:

| Marker file | Type |
|---|---|
| `package.json` | Node.js |
| `requirements.txt` or `pyproject.toml` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `index.html` (no package.json) | Static site |

### Monorepo detection

| Marker | Monorepo type |
|---|---|
| `pnpm-workspace.yaml` | pnpm workspace (shared) |
| `package.json` with `workspaces` field | npm/yarn workspace (shared) |
| `turbo.json` | Turborepo (shared) |
| Multiple subdirectories with separate `package.json`, no workspace config | Isolated monorepo |

**Isolated monorepo** (apps don't share code): set `rootDirectory` to the app's subdirectory (for example, `/apps/api`).

**Shared monorepo** (TypeScript workspaces, shared packages): do not set `rootDirectory`. Set custom build and start commands instead:

- pnpm: `pnpm --filter <package> build`
- npm: `npm run build --workspace=packages/<package>`
- yarn: `yarn workspace <package> build`
- Turborepo: `turbo run build --filter=<package>`

### Scaffolding hints

When no code exists, minimal starting points for common types:

- **Static site**: create `index.html` in the root directory.
- **Vite React**: `npm create vite@latest . -- --template react`
- **Python FastAPI**: create `main.py` with a FastAPI app and `requirements.txt` with `fastapi` and `uvicorn`.
- **Go**: create `main.go` with an HTTP server that reads `PORT` from the environment.

## Workspaces

Workspaces scope billing and team access. Most users have one personal workspace and possibly team workspaces.

```bash
railway whoami --json              # lists workspace memberships
```

When creating projects, Railway uses the default workspace unless `--workspace` is specified.

## Troubleshoot setup issues

- **CLI missing**: install via `brew install railway` or `curl -fsSL https://railway.com/install.sh | sh`
- **Not authenticated**: `railway login`
- **Project not found**: verify with `railway project list --json`, check workspace context
- **Service not found**: `railway service status --all --json` to list all services in the project
- **Wrong workspace**: inspect `railway whoami --json`, re-run with explicit `--workspace`
- **Permission denied**: check workspace role, mutations require member or admin access

## Validated against

- Docs: [cli.md](https://docs.railway.com/cli), [init.md](https://docs.railway.com/cli/init), [add.md](https://docs.railway.com/cli/add), [link.md](https://docs.railway.com/cli/link), [project.md](https://docs.railway.com/cli/project), [list.md](https://docs.railway.com/cli/list), [whoami.md](https://docs.railway.com/cli/whoami)
- CLI source: [init.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/init.rs), [add.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/add.rs), [project.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/project.rs), [list.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/list.rs), [bucket.rs](https://github.com/railwayapp/cli/blob/feat/bucket-command/src/commands/bucket.rs)
