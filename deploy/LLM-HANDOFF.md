# Archived: former Mac-hosted environment handoff

> **Historical only. Do not execute this runbook.** Staging and production moved
> to Google Cloud in August 2026, and the Mac-hosted convergers, Tailscale
> endpoints, and production checkout described below are retired. Current cloud
> operations live in the private
> [`SpeculativeTechnologies/crm-ops`](https://github.com/SpeculativeTechnologies/crm-ops)
> repository; start with `deploy/CLOUD-OPS.md`. Current local development and
> promotion rules are in [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md).

Updated 2026-07-25 in `/Users/ben/Projects/twenty`.

## Goal and branch

The goal is to let multiple teammates develop Twenty CRM without changing the
live instance on this Mac. Work is on:

```text
chore/isolate-dev-staging-production
```

Relevant commits:

```text
be8c9a94f1 docs: add isolated development and staging workflow
a8d4dc006b chore: add guarded local schema sync tooling
6484382c23 chore: add deterministic local CRM fixtures
```

The branch is pushed to
`origin/chore/isolate-dev-staging-production`.

## Environment model

- Developer machines run source code with their own `twenty-dev` Docker
  Postgres and Redis.
- Staging runs in the isolated `twenty-staging` Docker Compose project on the
  production Mac.
- Production remains the native installation in
  `/Users/ben/Deploy/twenty`.
- Changes flow from feature branch to pull request, staging, and then
  production. Never test an unreviewed change directly in production.

Start with:

```text
deploy/README.md
deploy/DEVELOPMENT.md
deploy/TEAM-WORKFLOW.md
deploy/STAGING.md
deploy/PRODUCTION.md
```

## Current live state

Production:

```text
checkout: /Users/ben/Deploy/twenty
branch: main
last observed commit: 5f463b61bc
local listener: 127.0.0.1:3010
URL: https://spectech-llm.tail7ba35e.ts.net
```

Staging:

```text
checkout used for host commands: /Users/ben/Projects/twenty
Compose project: twenty-staging
image: twenty-staging:fb1ed9c7d09127d19e8ce92e318ea3659ad5aad5
local listener: 127.0.0.1:3020
tailnet URL: https://spectech-llm.tail7ba35e.ts.net:3020
```

Production and staging run side by side. The live Tailscale identity is
`spectech-llm`, address `100.102.23.119`. The deprecated `spectech-llm-1`
profile was logged out. Tailscale CLI operations on this Mac must use:

```bash
/opt/homebrew/bin/tailscale --socket=/var/run/tailscaled.socket
```

## Staging setup

Important files:

```text
deploy/compose.staging.yml
deploy/.env.staging.example
deploy/staging.sh
deploy/refresh-staging-from-production.sh
deploy/staging-sanitize.sql
deploy/sync-staging-google-auth.sh
deploy/test-environment-isolation.sh
deploy/launchd/com.twenty.staging-refresh.plist
```

The real `deploy/.env.staging` is ignored. Staging uses isolated Postgres,
Redis, local file storage, encryption key, JWT signing key, and Compose
volumes.

Common commands:

```bash
bash deploy/staging.sh config
bash deploy/staging.sh up
bash deploy/staging.sh ps
bash deploy/staging.sh test
bash deploy/staging.sh logs
bash deploy/refresh-staging-from-production.sh --yes
```

The production-data refresh:

- snapshots the production database read-only;
- replaces only staging database and files;
- flushes staging Redis;
- disables message/calendar sync;
- clears connected-account credentials;
- deactivates active workflows;
- neutralizes webhooks;
- removes production custom domains;
- removes the copied production JWT signing key;
- restarts and tests staging.

A launch agent refreshes staging daily at 4:15 AM. Its log is
`/tmp/twenty-staging-refresh.log`.

## Google authentication

Staging Google OAuth is enabled using the same Google application with staging
callbacks. The configured redirects are:

```text
https://spectech-llm.tail7ba35e.ts.net:3020/auth/google/redirect
https://spectech-llm.tail7ba35e.ts.net:3020/auth/google-apis/get-access-token
```

The initial staging login failed because the production `core.signingKey` row
was encrypted with production's encryption key. That row was removed from
staging, Redis was flushed, and the services were restarted. Staging generated
its own signing key successfully on the next login. Future refreshes delete
copied signing keys in `staging-sanitize.sql`.

Google login and a fully authenticated CRM load were subsequently verified.

## Local development schema tooling

Developers use:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker
bash deploy/local-schema.sh check
bash deploy/local-schema.sh sync
```

`local-schema.sh`:

- requires the standard localhost development URLs;
- requires the actual `twenty-dev` Docker containers;
- refuses `/Users/ben/Deploy/twenty`;
- applies instance migrations;
- runs all workspace upgrades;
- invalidates metadata caches;
- fails when instance or workspace upgrade status is behind/failed.

The post-merge hook routes developer checkouts to `local-schema.sh sync` and
the production checkout to the existing `update-after-merge.sh`.

## Deterministic local fixtures

Commands:

```bash
bash deploy/local-data.sh seed
bash deploy/local-data.sh verify
bash deploy/local-data.sh reset --yes
```

The tooling uses Twenty's supported `workspace:seed:dev --light` seeder. A bug
was fixed so light mode actually limits each standard object to five records.
It creates one deterministic workspace with standard CRM records and
relationships and skips the large demo dataset, attachment payloads, and
demo-only custom objects.

Local login:

```text
URL: http://localhost:3001
email: tim@apple.dev
password: tim@apple.dev
```

The fixture reset is destructive only to the guarded `twenty-dev` environment.

## Development mirror

The light fixture only covers Twenty's standard objects. This workspace has
seven more (`candidate`, `fellow`, `mentor`, `reviewer`, `enrollment`,
`connection`, `employmentHistory`) and about 150 extra fields, so schema work
against the fixture is not representative. The mirror closes that gap.

```text
deploy/devdata-publish.sh    builds a scrubbed dump on the staging host
deploy/devdata-scrub.sql     what is removed, applied to a throwaway build DB
deploy/devdata-verify.sql    assertions, run at build time and at restore time
deploy/local-data.sh mirror  installs a mirror on a developer machine
deploy/LLM-LOCAL-DEV.md      pipeline instructions for coding agents
```

Staging is never modified: the snapshot is restored into `devdata_build`,
scrubbed there, verified, dumped, and dropped. The mirror keeps CRM records,
metadata, and production row counts; it removes mailbox and calendar content,
unlinked participant addresses, timeline field diffs, and all credentials.
Every account's password becomes `devmirror`.

`local-data.sh mirror` fails closed: a dump that does not pass
`devdata-verify.sql` causes the local database to be wiped rather than kept.

Dumps live in the gitignored `deploy/.devdata/`, newest three retained.

## Validation already performed

- Staging Compose configuration passes.
- Environment-isolation test passes.
- Staging and production health endpoints pass.
- Production and staging were observed running simultaneously.
- Staging Google OAuth redirect and login work.
- A clean authenticated browser session loaded the staging Companies page and
  CRM records.
- Local schema/data commands correctly refuse this production-host checkout
  because it does not run the `twenty-dev` Docker project.
- Fixture limiter unit tests pass: 2 tests.
- Changed TypeScript files pass focused formatting and lint checks.
- Shell scripts pass `bash -n`.
- `devdata-publish.sh` ran end to end against live staging in about 15 seconds
  and produced a 27 MB dump.
- The dump was restored into a separate check database and inspected directly:
  31,394 messages and 17,487 calendar events retained with zero unscrubbed
  bodies, subjects or titles; 7,944 unlinked participant addresses
  pseudonymized while 75,013 CRM-linked ones were preserved; 152,894 timeline
  rows retained with no field diffs; 6,100 people, 4,996 companies, 55 fellows,
  112 mentors, 896 enrollments, 641 notes, 14 objects and 574 fields intact;
  zero signing keys, sessions, API keys, 2FA methods, OAuth tokens, enabled
  sync channels or active workflows.
- `devdata-verify.sql` correctly refuses an unscrubbed database, and
  `devdata-scrub.sql` refuses to run outside `devdata_build`.
- The `devmirror` password validates against the seeded bcrypt hash.
- `--stdout` mode produces a valid custom-format archive.
- Scratch databases were dropped and staging was confirmed unchanged.

The developer-machine half of `local-data.sh mirror` (Docker restore into
`twenty-dev`) is still untested, because this host deliberately has no
`twenty-dev` project. Its guards and argument handling were exercised.

## Resource note

This Mac has 16 GB RAM, Colima is configured for up to 8 GB, and production
runs natively. A staging black-screen report coincided with host memory
pressure and several abandoned headless browser processes from diagnostics.
Those exact processes were stopped; staging then worked. No staging container
was OOM-killed or restarted. Avoid leaving browser automation processes alive
and monitor `docker stats` plus `memory_pressure` during heavy tests.

## Remaining work

The next required validation is on a separate developer machine:

```bash
git fetch origin
git switch --track origin/chore/isolate-dev-staging-production
bash packages/twenty-utils/setup-dev-env.sh --docker
bash deploy/local-schema.sh check
bash deploy/local-data.sh seed
bash deploy/local-data.sh verify
bash deploy/local-data.sh mirror
bash deploy/local-data.sh verify
yarn start
```

The mirror pull needs SSH to the staging host. Override the defaults with
`TWENTY_DEVDATA_HOST` and `TWENTY_DEVDATA_REMOTE_REPO` if the tailnet name or
checkout path differs, or hand over a dump and use `mirror --from-file`.

Then sign in locally and exercise the fixture relationships. The branch should
go through review before merging. Production has deliberately not been updated
with this branch.

There is not yet a single guarded promotion command that builds an exact SHA
for staging and then promotes the same approved SHA to production. The current
process is documented and manual. Adding release automation is the next major
operational improvement.

## Workspace hygiene

Unrelated untracked files were deliberately preserved and must not be included
in environment commits:

```text
IMG_6128.png
LOCAL-FIRST-PLAN.md
serve-frontend-debug.mjs
```
