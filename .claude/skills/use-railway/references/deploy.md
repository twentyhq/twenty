# Deploy

Ship code, manage releases, and configure builds.

## Deploy code

### Standard deploy

```bash
railway up --detach -m "<release summary>"
```

`--detach` returns immediately instead of streaming build logs. Without it, the deploy blocks execution until the build finishes. Always include `-m` with a release summary for auditability.

### Watch the build

```bash
railway up --ci -m "<release summary>"
```

`--ci` streams build logs and exits when the build completes. Use this when the user wants to see build output or when you need to triage build failures immediately.

### Targeted deploy

When multiple services exist, target explicitly:

```bash
railway up --service <service> --environment <environment> --detach -m "<summary>"
```

### Deploy to an unlinked project

For CI or cross-project deploys where the directory isn't linked:

```bash
railway up --project <project-id> --environment <environment> --detach -m "<summary>"
```

`--project` requires `--environment`. Railway needs both to resolve context.

## Manage releases

### Redeploy and restart

```bash
railway redeploy --service <service> --yes       # rebuild and deploy from same source
railway restart --service <service> --yes         # restart without rebuilding
```

Redeploy triggers a full build cycle. Restart only restarts the running container. Use restart when the code hasn't changed but the service needs a fresh process (for example, after variable changes).

### Remove latest deployment

```bash
railway down --service <service> --yes
```

This removes the latest successful deployment but doesn't delete the service. To delete a service entirely, use environment config patching (see [configure.md](configure.md)).

## Deployment history and logs

```bash
railway deployment list --service <service> --limit 20 --json
railway logs --service <service> --lines 200 --json              # runtime logs
railway logs --service <service> --build --lines 200 --json      # build logs
railway logs --latest --lines 200 --json                         # latest deployment
```

`railway logs` streams indefinitely when no bounding flags are given. An open stream blocks execution and never returns. Always use `--lines`, `--since`, or `--until` to get a bounded fetch.

## Build configuration

Railway uses Railpack as the default builder. It detects language and framework from repo contents and assembles a build plan automatically.

### Builder selection

Three builder options, set via service config:

- **RAILPACK** auto-detects language and framework, builds from source (default)
- **NIXPACKS** is the legacy builder. DO NOT USE THIS, use RAILPACK instead.
- **DOCKERFILE** uses a Dockerfile you provide

```bash
railway environment edit --service-config <service> build.builder RAILPACK
railway environment edit --service-config <service> build.builder DOCKERFILE
railway environment edit --service-config <service> build.dockerfilePath "docker/Dockerfile.prod"
```

### Build and start commands

Override when auto-detection gets it wrong:

```bash
railway environment edit --service-config <service> build.buildCommand "npm run build"
railway environment edit --service-config <service> deploy.startCommand "npm start"
```

Common reasons to override: wrong package manager detected, multiple build targets in a monorepo, framework-specific output paths.

### Railpack environment variables

Control Railpack behavior by setting these as service variables:

| Variable | Purpose |
|---|---|
| `RAILPACK_NODE_VERSION` | Pin Node.js version (e.g., `20`, `22.1.0`) |
| `RAILPACK_PYTHON_VERSION` | Pin Python version (e.g., `3.12`) |
| `RAILPACK_GO_BIN` | Go binary name to build |
| `RAILPACK_STATIC_FILE_ROOT` | Directory for static site output (e.g., `dist`, `build`) |
| `RAILPACK_SPA_OUTPUT_DIR` | SPA output directory with client-side routing support |
| `RAILPACK_PACKAGES` | Additional system packages for the build |
| `RAILPACK_BUILD_APT_PACKAGES` | Apt packages available during build only |
| `RAILPACK_DEPLOY_APT_PACKAGES` | Apt packages available at runtime only |

For full Railpack documentation including language-specific detection, config files, and framework support: https://railpack.com/llms.txt

### Static sites

Railpack detects static sites from `Staticfile`, `index.html`, or `RAILPACK_STATIC_FILE_ROOT` and serves them with a built-in static file server. If the build outputs to a non-standard directory (for example, `dist/`, `build/`), set `RAILPACK_STATIC_FILE_ROOT` as a variable so Railpack knows where to find the output.

## Monorepo patterns

### Isolated monorepo

When services don't share code, isolate each with its own root directory:

```bash
railway environment edit --service-config <service> source.rootDirectory "/packages/api"
```

Each service sees only its subdirectory. This approach is clean but breaks if services import from shared packages.

### Shared monorepo

When services depend on shared packages or root-level workspace config, keep the full repo context and scope via build/start commands instead:

```bash
# pnpm workspaces
railway environment edit --service-config <service> build.buildCommand "pnpm --filter api build"
railway environment edit --service-config <service> deploy.startCommand "pnpm --filter api start"

# yarn workspaces
railway environment edit --service-config <service> build.buildCommand "yarn workspace api build"
railway environment edit --service-config <service> deploy.startCommand "yarn workspace api start"

# bun workspaces
railway environment edit --service-config <service> build.buildCommand "bun run --filter api build"
railway environment edit --service-config <service> deploy.startCommand "bun run --filter api start"

# turborepo (works with any package manager)
railway environment edit --service-config <service> build.buildCommand "npx turbo run build --filter=api"
railway environment edit --service-config <service> deploy.startCommand "npx turbo run start --filter=api"
```

Don't set a restrictive `rootDirectory` in this case. The build needs access to the workspace root.

### Watch paths

Prevent unrelated package changes from redeploying every service:

```bash
railway environment edit --service-config <service> build.watchPatterns '["packages/api/**","packages/shared/**"]'
```

### Common monorepo pitfalls

- **Using `rootDirectory` with shared imports**: if service A imports from `packages/shared/`, setting `rootDirectory: "/packages/a"` hides the shared code. Use the shared monorepo pattern instead.
- **Forgetting watch paths**: without watch paths, every push redeploys all services, even when only one package changed.
- **Wrong filter target**: `pnpm --filter api` uses the `name` field in each package's `package.json`, not the directory name. Verify the package name matches.

## Docker cache mounts

BuildKit `--mount=type=cache` mounts persist directories (e.g. package manager or build tool caches) between Railway builds on the same machine, outside the image layer system.

### Required ID format

Railway enforces that every cache mount has an explicit `id` in the format:

```
id=s/<service-id>-<descriptor>
```

**Environment variables cannot be used in cache mount IDs** — Railway rejects substitutions like `${RAILWAY_CACHE_KEY}` or `$VAR`. The ID must be a literal string.

Example for a Node/Nx project:

```dockerfile
RUN --mount=type=cache,id=s/29a802aa-b44b-4b37-b13e-fe10da3ab6dc-nx-cache,sharing=locked,target=/app/.nx/cache \
    npx nx build my-app
```

Use `sharing=locked` when multiple build stages mount the same cache ID to prevent corruption from concurrent access.

### Critical limitation: one Dockerfile, multiple services

Railway validates the cache mount ID against the **building service's own ID**. If the same Dockerfile is used by more than one Railway service (e.g. `twenty` and `twenty-worker`), a single hardcoded `s/<service-id>` will be valid for one service and rejected by the other.

**There is no workaround** — env var substitution is forbidden in mount IDs, so you cannot make the ID dynamic. If a Dockerfile is shared across services, **do not use cache mounts**. Docker layer caching of `node_modules` (via a `common-deps` base stage) is the better alternative for multi-service builds. This is an acknowledged Railway limitation: https://station.railway.com/questions/can-t-use-cache-mounts-on-shared-dockerf-e578f8ca

### Common errors

| Error | Cause | Fix |
|---|---|---|
| `Cache mount ID is not prefixed with cache key` | `id` omitted, wrong format, or wrong service ID | Use `id=s/<this-service-id>-<descriptor>` — but see limitation above |
| `Cache mounts MUST be in the format --mount=type=cache,id=<cache-id>` | `id` missing entirely | Add the `id` field |
| Build arg in `id` field | Used `${VAR}` or `$VAR` in the ID | Env vars are not supported — use a literal string or remove the mount |

## Troubleshoot deploys

- **No project/service context**: run `railway link` or pass `--project` with `--environment`
- **Build fails before compile**: check dependency graph, lockfiles, and whether the right builder is selected
- **Build succeeds but app crashes**: verify start command and required runtime variables
- **Wrong files in build**: check root directory and watch patterns
- **`railway down` treated as delete**: `down` only removes the latest deployment. For full service deletion, use `isDeleted` in config patch (see [configure.md](configure.md))
- **Wrong Node/Python version detected**: set `RAILPACK_NODE_VERSION` or `RAILPACK_PYTHON_VERSION` as a service variable to pin the version
- **Missing system package at runtime**: add the package to `RAILPACK_DEPLOY_APT_PACKAGES`

## Validated against

- Docs: [up.md](https://docs.railway.com/cli/up), [deploying.md](https://docs.railway.com/cli/deploying), [deployment.md](https://docs.railway.com/cli/deployment), [down.md](https://docs.railway.com/cli/down), [railpack.md](https://docs.railway.com/builds/railpack), [monorepo.md](https://docs.railway.com/deployments/monorepo)
- CLI source: [up.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/up.rs), [deployment.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/deployment.rs), [down.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/down.rs), [redeploy.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/redeploy.rs), [restart.rs](https://github.com/railwayapp/cli/blob/a8a5afe/src/commands/restart.rs)
