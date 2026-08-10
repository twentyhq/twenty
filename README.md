# Speculative Technologies CRM

This is our fork of [Twenty](https://github.com/twentyhq/twenty), the open-source
CRM. It runs the live CRM the team uses every day. Upstream's own README is kept
verbatim at [README.upstream.md](README.upstream.md).

Read this before touching anything: the fork is not a sandbox. `main` deploys to
the instance holding real fellow, mentor, and candidate records.

## Repository layout

| Path | What it is |
|---|---|
| `deploy/` | Local-development tooling, public workflow docs, and retired deployment assets kept for reference |
| `packages/` | Upstream's monorepo (front, server, ui, shared, emails, website, ...) plus our changes inside it |
| `CLAUDE.md` | Commands and code conventions, for humans and coding agents |
| `TODO.md` | Current work queue for this fork |

## Which repository to use

Application development stays in this repository. Frontend, backend, schema,
migrations, integrations, CI, image builds, and the GitHub promotion workflows
all belong in `SpeculativeTechnologies/CRM`.

The private
[`SpeculativeTechnologies/crm-ops`](https://github.com/SpeculativeTechnologies/crm-ops)
repository is the source of truth for running the cloud installation: Docker
Compose, host deployment and backup scripts, Cloudflare tunnel configuration,
systemd units, access, restores, and incident response. Changes that span the
application and its runtime should use coordinated PRs in both repositories
rather than copying private operational detail into this public fork.

## Environments

| Environment | Where | Data | Purpose |
|---|---|---|---|
| Development | Each developer's own machine | Developer-owned Postgres, Redis, storage | Build and test feature branches |
| Staging | Google Cloud, [crm-staging.spec.tech](https://crm-staging.spec.tech) | Isolated copy of production data | Validate a candidate commit |
| Production | Google Cloud, [crm.spec.tech](https://crm.spec.tech) | Live CRM data | The instance the team uses |

The boundaries are mandatory. Develop only on a developer-owned machine with
developer-owned Postgres, Redis, and storage. Never point development at cloud
services or copy cloud secrets into a local environment. Full rules are in
[deploy/TEAM-WORKFLOW.md](deploy/TEAM-WORKFLOW.md).

## Getting started

```bash
git clone git@github.com:SpeculativeTechnologies/CRM.git twenty
cd twenty
corepack enable
bash packages/twenty-utils/setup-dev-env.sh --docker
cp deploy/git-hooks/post-merge .git/hooks/post-merge && chmod +x .git/hooks/post-merge
bash deploy/local-schema.sh check
bash deploy/local-data.sh seed
yarn start
```

The app is at `http://localhost:3001`, the backend at `http://localhost:3000`.
[deploy/DEVELOPMENT.md](deploy/DEVELOPMENT.md) covers the rest: verification
smoke test, the daily loop, and how to test schema changes both ways.

### Which dataset

```bash
bash deploy/local-data.sh seed     # small synthetic fixture
bash deploy/local-data.sh mirror   # scrubbed copy of the real CRM
bash deploy/local-data.sh verify   # report what is currently installed
```

The fixture only has Twenty's standard objects. Our workspace has seven more
(`candidate`, `fellow`, `mentor`, `reviewer`, `enrollment`, `connection`,
`employmentHistory`) and roughly 150 extra fields, so a migration that passes
against the fixture can still fail in production. Use the fixture for UI work
and CI, the mirror for anything touching entities, migrations, workspace
upgrades, views, or search.

**A mirror is confidential.** It contains real people, real companies, and real
notes about them, scrubbed of credentials and message bodies but not anonymized.
Never commit or upload a dump, and run `bash deploy/local-data.sh reset --yes`
when you stop working on the project.

## Changing things

Promotion is forward-only:

```text
feature branch -> pull request/CI -> staging -> production
```

Branch from `origin/main`, push, open a PR against
`SpeculativeTechnologies/CRM:main`, wait for `ci-fork-status-check` and review,
then merge on GitHub. Never push directly to `main`. Schema changes travel with
the code that needs them, as committed instance commands: never repair drift with
manual production SQL, and never copy a schema between environments. Data may be
copied downward only through the verified scrubbed-mirror workflow; schema may
not.

Deploys go through the **Deploy to staging** and **Deploy to production** GitHub
workflows. Those workflows deploy a pinned image directly to the appropriate
cloud VM and wait for the result; production accepts only code merged to `main`
that staging has already run, behind an approval gate. Operational details,
backups, and rollback live in the private
[`crm-ops` cloud runbook](https://github.com/SpeculativeTechnologies/crm-ops/blob/main/deploy/CLOUD-OPS.md).

## Where to read next

- [deploy/TEAM-WORKFLOW.md](deploy/TEAM-WORKFLOW.md) — the authoritative
  procedure: environment boundaries, branching, review, promotion
- [deploy/DEVELOPMENT.md](deploy/DEVELOPMENT.md) — developer machine setup and
  daily workflow
- [deploy/STAGING.md](deploy/STAGING.md) — public staging workflow and link to
  the private cloud runbook
- [deploy/PRODUCTION.md](deploy/PRODUCTION.md) — public production workflow and
  link to the private cloud runbook
- [deploy/README.md](deploy/README.md) — index of the deploy directory
- [CLAUDE.md](CLAUDE.md) — commands, architecture, code conventions
- [deploy/LLM-LOCAL-DEV.md](deploy/LLM-LOCAL-DEV.md) and
  [deploy/LLM-DEPLOY-HOST.md](deploy/LLM-DEPLOY-HOST.md) — the same pipelines
  written for coding agents

## Relationship to upstream

`twentyhq/twenty` is the `upstream` remote. `deploy/sync-upstream.sh` runs
weekly and opens a `sync/upstream-YYYY-MM-DD` PR; it never merges automatically,
because upstream `main` is a fast-moving dev branch and ours deploys to the live
CRM. Ben owns those merges, and they go through CI, staging, and production like
any other change.

Our changes on top of upstream are mostly the `deploy/` directory, the fork CI
and deploy workflows, the mass email composer, and the environment banner.

This file is marked `merge=ours` in `.gitattributes` so upstream README edits do
not conflict here. That only takes effect once per clone:

```bash
git config merge.ours.driver true
```

Without it the merge driver is missing and git falls back to a normal conflict,
which is noisy but not dangerous. `README.upstream.md` is a snapshot taken when
the fork README was written; the live version is
[upstream's README](https://github.com/twentyhq/twenty/blob/main/README.md).
