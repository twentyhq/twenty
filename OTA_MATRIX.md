# Twenty OTA Pressure Matrix

Scope: `twentyhq/twenty` local contributor and self-host readiness surfaces modeled from repository docs, scripts, and CI workflows. Native Windows is intentionally treated as unsupported; the repo documents Windows through WSL.

Contract: [`ota.yaml`](./ota.yaml)

## Evidence Sources

- `packages/twenty-docs/developers/contribute/capabilities/local-setup.mdx`
- `packages/twenty-docs/developers/contribute/commands.mdx`
- `packages/twenty-utils/setup-dev-env.sh`
- `.github/workflows/ci-front.yaml`
- `.github/workflows/ci-server.yaml`
- `.github/workflows/ci-docs.yaml`
- `.github/workflows/ci-test-docker-compose.yaml`
- `packages/twenty-front/project.json`
- `packages/twenty-server/project.json`
- `packages/twenty-docker/docker-compose.yml`
- `packages/twenty-docker/docker-compose.dev.yml`

## Workflow Matrix

| Workflow | Intent | Context | Prepare | Setup | Run | Readiness/Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| `verify` | CI verification | `host` | - | `install` | `test` | Frontend + backend unit test surface passes |
| `native-dev` | Local development | `host` | `prepare:env:server` | `setup:services` | `dev` | `api` (`:3000/healthz`) + `web` (`:3001/`) ready |
| `integration` | CI verification | `host` | `prepare:env:server` | `setup:services` | `test:server:integration` | Integration tests with DB reset pass |
| `docker-selfhost` | Packaged runtime | `docker-host` | - | `prepare:env:compose` | `run:compose` | `api` (`:3000/healthz`) ready |

## Capability Coverage

| Area | Covered in contract | Notes |
| --- | --- | --- |
| Install | Yes | `install` uses `yarn --immutable --check-cache` |
| Build | Yes | `build:shared`, `build:front`, `build:server` |
| Lint | Yes | `lint`, `lint:front`, `lint:server` |
| Typecheck | Yes | `typecheck`, `typecheck:front`, `typecheck:server` |
| Test | Yes | `test`, `test:front`, `test:server`, `test:server:integration` |
| Dev startup | Yes | `dev`, `dev:front`, `dev:server`, `dev:worker` |
| Prod/self-host startup | Yes | `run:compose` on `packages/twenty-docker/docker-compose.yml` |
| Services | Yes | Local/dev infra via `setup:services`; compose stack via `run:compose` |
| Health checks | Yes | `api`, `web`, `postgres`, `redis` surfaces with readiness probes |
| Native + container path | Yes | Native Linux/macOS workflows + Docker Compose self-host workflow; native Windows is unsupported and should fail early |
| Agent boundary | Yes | `readiness_strict`; env files, workflow files, lockfile, package manifest, and `ota.yaml` are protected |
| Side effects | Yes | Dependency install, Docker, Postgres, Redis, network, generated env, and build outputs are declared |
| Version capability | Yes | `metadata.ota.minimum_version` requires Ota >= 1.6.15 |

## OTA Gaps Exposed

| Gap | Severity | Where | Observed | Expected | Impact | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- |
| Disjunctive dependency modeling (`local Postgres/Redis` OR `Docker services`) is not first-class | High | `setup:services` in this contract; `packages/twenty-utils/setup-dev-env.sh` in repo | Contract must use the repo script to encode fallback logic | Declarative `any_of` requirements across service providers | Reduced portability and explainability; doctor/up cannot explain branch choice declaratively | Add requirement groups (e.g. `requirements.any_of`) and service-provider alternatives |
| Agent-safe transitive dependency validation is incomplete | High | `agent.safe_tasks` vs tasks that depend on env-writing setup | Ota validates direct `effects.writes`, but does not fully reject safe tasks whose dependencies write protected paths | Agent-safe analysis should include transitive task dependencies | Agents can be told a task is safe even when its dependency path mutates protected state | Extend agent safety validation across the dependency graph |
| Preview context wording can be misleading | Medium | `ota run install --dry-run` | Output prints task context `host`, but also reports `Selected Context: docker-host` in this repo | Selected context should match the selected task or explain inherited/alternate context clearly | Trust noise when reviewing dry-run output | Fix preview context selection/display semantics |
| Multi-process native lifecycle (`front + server + worker`) has only aggregate runtime truth | Medium | `dev` task (`yarn start`) | Ota observes one long-running command and two HTTP surfaces; worker liveness is implicit | First-class sub-process receipts or multi-process runtime components with per-component readiness | Weak diagnostics when one sub-process fails while shell remains alive | Add runtime component model for grouped long-running processes |
| Compose secret bootstrap is still command-shaped | Medium | `prepare:env:compose` | Contract follows docs with shell + `openssl rand`, but cannot declare generated secret semantics directly | Structured secret declarations (required/generated/rotation notes) for dotenv targets | Higher operator error risk for first self-host run | Add contract-level secret generation policy and required-variable validation for dotenv sources |
| CI conditional execution (`changed-files` + `nx-affected`) is not represented as contract-native planning | Medium | Multiple `.github/workflows/ci-*.yaml` | Contract models canonical tasks, but not GitHub-triggered changed-file gating semantics | Optional conditional execution DSL for task selection predicates | Parity drift risk between contract run plans and optimized CI cost controls | Add optional task selection predicates for changed-files and affected scopes |

## Validation Status

Local validation:

- `ota validate .` passes with one advisory: `install` is agent-safe and network-dependent.
- `ota up --workflow docker-selfhost --dry-run .` is runnable.
- `ota up --workflow native-dev --dry-run .` blocks locally because this machine has Node `23.11.0`, while Twenty requires Node `^24.5.0`.
- `ota run install --dry-run .` correctly blocks on Node `^24.5.0`, but exposes the preview context wording issue above.

Remote matrix:

- `.github/workflows/test-ota-contract-matrix.yml` validates the contract on Ubuntu, macOS, and Windows.
- Ubuntu runs Docker self-host runtime proof.
- macOS covers native dry-run contract shape.
- Windows proves unsupported-host diagnosis for native Twenty development.
