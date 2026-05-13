# Create Twenty App

Package: `create-twenty-app` v2.3.0. Binary: `create-twenty-app` / `npx create-twenty-app@latest`.

## CLI Contract

```
create-twenty-app [directory] [options]
```

| Option | Purpose |
|---|---|
| `[directory]` | Target directory (lowercase, numbers, hyphens only) |
| `--example <name>` | Scaffold from example (hello-world, postcard) |
| `-n, --name <name>` | App name (skips prompt) |
| `-d, --display-name <name>` | Display name (skips prompt) |
| `--description <text>` | Description (skips prompt) |
| `--skip-local-instance` | Skip Docker server + OAuth setup |
| `-y, --yes` | Auto-confirm server start prompts |

**Non-interactive recipe**: `npx create-twenty-app@latest my-app --name my-app --display-name "My App" --description "Description" --skip-local-instance --yes`

## Scaffold Flow

1. **Resolve inputs** — directory/name/display/description from options or interactive prompts
2. **Choose source** — `--example` downloads from GitHub tarball, otherwise embedded template
3. **Copy template** — `src/constants/template/` tree copied to target
4. **Mutate placeholders** — replace UUID identifiers, display name, description, SDK versions
5. **Dotfile rename** — `gitignore` → `.gitignore`, `github` → `.github`
6. **Create `public/`** — empty directory for static assets
7. **Install deps** — `corepack enable && yarn install` (failure is warning-only)
8. **Git init** — `git init` + initial commit (silent on failure)
9. **Local server** — optional Docker start + OAuth login (skipped with `--skip-local-instance`)
10. **Print next steps** — `cd <dir>` + `yarn twenty dev`

## Generated File Structure

```
my-app/
├── .github/workflows/
│   ├── ci.yml                    # Integration tests against spawned Twenty instance
│   └── cd.yml                    # Deploy + install on push/label
├── src/
│   ├── __tests__/
│   │   ├── global-setup.ts       # Health check, app uninstall, dev --once
│   │   └── schema.integration-test.ts  # Assert app visible + Note CRUD
│   ├── constants/
│   │   └── universal-identifiers.ts    # Generated UUIDs
│   ├── application-config.ts     # defineApplication() call
│   └── default-role.ts          # defineRole() with permissions
├── public/                       # Static assets (empty)
├── package.json                  # Scripts: twenty help, lint, test, test:watch
├── tsconfig.json / tsconfig.spec.json
├── vitest.config.ts              # Integration test config
├── .nvmrc / .yarnrc.yml / .oxlintrc.json / .gitignore
├── AGENT.md / CLAUDE.md / LLMS.md   # AI agent guidance
└── README.md
```

## Generated CI Workflow (ci.yml)

Triggers: push to `main`, all pull requests.

Steps:
1. Spawn `twentyhq/twenty/.github/actions/spawn-twenty-app-dev-test@main`
2. Corepack + Node from `.nvmrc` + Yarn cache
3. `yarn install --immutable`
4. `yarn test` with `TWENTY_API_URL` + `TWENTY_API_KEY` from spawned instance

## Generated CD Workflow (cd.yml)

Triggers: push to `main`, pull request labeled `deploy`.

Steps:
1. `deploy-twenty-app@main` — validate + build + publish to target instance
2. `install-twenty-app@main` — install/upgrade on workspace

Requires secrets: `TWENTY_DEPLOY_URL` (defaults `http://localhost:3000`), `TWENTY_DEPLOY_API_KEY`.

## Example Download

`--example <name>` fetches from `twentyhq/twenty` GitHub repo tarball. Validates example exists at `packages/twenty-apps/examples/<name>`. Lists available examples on failure. Falls back to default template with user confirmation.

Available examples: `hello-world`, `postcard` (from CI evidence).

## Tests (in scaffolder package)

- Template copy + placeholder replacement
- UUID uniqueness across scaffolds
- Label conversion (camelCase, kebab-case)

**Gaps**: No tests for CLI parsing, example download, install/git behavior, local server/OAuth flow, or workflow template contents.
