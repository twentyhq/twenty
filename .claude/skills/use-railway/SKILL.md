---
name: use-railway
description: >
  Operate Railway infrastructure: create projects, provision services and
  databases, manage object storage buckets, deploy code, configure environments
  and variables, manage domains, troubleshoot failures, check status and metrics,
  and query Railway docs. Use this skill whenever the user mentions Railway,
  deployments, services, environments, buckets, object storage, build failures,
  or infrastructure operations, even if they don't say "Railway" explicitly.
allowed-tools: Bash(railway:*), Bash(which:*), Bash(command:*), Bash(npm:*), Bash(npx:*), Bash(curl:*)
---

# Use Railway

## Railway resource model

Railway organizes infrastructure in a hierarchy:

- **Workspace** is the billing and team scope. A user belongs to one or more workspaces.
- **Project** is a collection of services under one workspace. It maps to one deployable unit of work.
- **Environment** is an isolated configuration plane inside a project (for example, `production`, `staging`). Each environment has its own variables, config, and deployment history.
- **Service** is a single deployable unit inside a project. It can be an app from a repo, a Docker image, or a managed database.
- **Bucket** is an S3-compatible object storage resource inside a project. Buckets are created at the project level and deployed to environments. Each bucket has credentials (endpoint, access key, secret key) for S3-compatible access.
- **Deployment** is a point-in-time release of a service in an environment. It has build logs, runtime logs, and a status lifecycle.

Most CLI commands operate on the linked project/environment/service context. Use `railway status --json` to see the context, and `--project`, `--environment`, `--service` flags to override.

## Preflight

Before any mutation, verify context:

```bash
command -v railway                # CLI installed
railway whoami --json             # authenticated
railway --version                 # check CLI version
railway status --json             # linked project/environment/service
```

If the CLI is missing, guide the user to install it. 

```bash
bash <(curl -fsSL cli.new) # Shell script (macOS, Linux, Windows via WSL)
brew install railway # Homebrew (macOS)
npm i -g @railway/cli # npm (macOS, Linux, Windows). Requires Node.js version 16 or higher.
```

If not authenticated, run `railway login`. If not linked, run `railway link --project <id-or-name>`.

If a command is not recognized (for example, `railway environment edit`), the CLI may be outdated. Upgrade with:

```bash
railway upgrade
```

## Common quick operations

These are frequent enough to handle without loading a reference:

```bash
railway status --json                                    # current context
railway whoami --json                                    # auth and workspace info
railway project list --json                              # list projects
railway service status --all --json                      # all services in current context
railway variable list --service <svc> --json             # list variables
railway variable set KEY=value --service <svc>           # set a variable
railway logs --service <svc> --lines 200 --json          # recent logs
railway up --detach -m "<summary>"                       # deploy current directory
railway bucket list --json                               # list buckets in current environment
railway bucket info --bucket <name> --json               # bucket storage and object count
railway bucket credentials --bucket <name> --json        # S3-compatible credentials
```

## Routing

For anything beyond quick operations, load the reference that matches the user's intent. Load only what you need, one reference is usually enough, two at most.

| Intent | Reference | Use for |
|---|---|---|
| Create or connect resources | [setup.md](references/setup.md) | Projects, services, databases, buckets, templates, workspaces |
| Ship code or manage releases | [deploy.md](references/deploy.md) | Deploy, redeploy, restart, build config, monorepo, Dockerfile |
| Change configuration | [configure.md](references/configure.md) | Environments, variables, config patches, domains, networking |
| Check health or debug failures | [operate.md](references/operate.md) | Status, logs, metrics, build/runtime triage, recovery |
| Request from API, docs, or community | [request.md](references/request.md) | Railway GraphQL API queries/mutations, metrics queries, Central Station, official docs |

If the request spans two areas (for example, "deploy and then check if it's healthy"), load both references and compose one response.

## Execution rules

1. Prefer Railway CLI. Fall back to `scripts/railway-api.sh` for operations the CLI doesn't expose.
2. Use `--json` output where available for reliable parsing.
3. Resolve context before mutation. Know which project, environment, and service you're acting on.
4. For destructive actions (delete service, remove deployment, drop database), confirm intent and state impact before executing.
5. After mutations, verify the result with a read-back command.

## Composition patterns

Multi-step workflows follow natural chains:

- **Add object storage**: setup (create bucket), setup (get credentials), configure (set S3 variables on app service)
- **First deploy**: setup (create project + service), configure (set variables and source), deploy, operate (verify healthy)
- **Fix a failure**: operate (triage logs), configure (fix config/variables), deploy (redeploy), operate (verify recovery)
- **Add a domain**: configure (add domain + set port), operate (verify DNS and service health)
- **Docs to action**: request (fetch docs answer), route to the relevant operational reference

When composing, return one unified response covering all steps. Don't ask the user to invoke each step separately.

## Setup decision flow

When the user wants to create or deploy something, determine the right action from current context:

1. Run `railway status --json` in the current directory.
2. **If linked**: add a service to the existing project (`railway add --service <name>`). Do not create a new project unless the user explicitly says "new project" or "separate project".
3. **If not linked**: check the parent directory (`cd .. && railway status --json`).
   - **Parent linked**: this is likely a monorepo sub-app. Add a service and set `rootDirectory` to the sub-app path.
   - **Parent not linked**: run `railway list --json` and look for a project matching the directory name.
     - **Match found**: link to it (`railway link --project <name>`).
     - **No match**: create a new project (`railway init --name <name>`).
4. When multiple workspaces exist, match by name from `railway whoami --json`.

**Naming heuristic**: app names like "flappy-bird" or "my-api" are service names, not project names. Use the directory or repo name for the project.

## Response format

For all operational responses, return:
1. What was done (action and scope).
2. The result (IDs, status, key output).
3. What to do next (or confirmation that the task is complete).

Keep output concise. Include command evidence only when it helps the user understand what happened.
