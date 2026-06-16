# twenty-partners

A Twenty app that turns the CRM into the operating system for the Twenty partner program:
intake partner-eligible deals, match them to vetted marketplace partners, and track the
matching pipeline end-to-end.

Built on [Twenty](https://twenty.com) with [`twenty-sdk`](https://www.npmjs.com/package/twenty-sdk) v2.5.

## What's inside

- **Custom object: `Partner`** — slug, status, availability, served geos, languages spoken,
  deployment expertise, Calendly link, last-match timestamp. See `src/objects/partner.object.ts`.
- **Opportunity extensions** — `matchStatus`, `designDocStatus`,
  `introSentAt`, `lastRelanceSentAt`, `tftId`, plus a `partner` relation.
- **Logic functions**
  - `list-available-partners` — surfaces matchable partners for a given opportunity.
  - `post-install` — first-run setup.
- **Roles** (`src/roles/`)
  - **Twenty Partner Ops** — internal team role, full CRUD on Partner/Company/Person/Opportunity.
  - **Partner** — external-partner role, object-scoped (`canReadAllObjectRecords: false`;
    explicit per-object permissions). Record-level scoping (a partner sees only their own
    deals) is available now that Twenty ships row-level permissions (twentyhq/twenty#21386).
- **Views** (`src/views/`)
  - `Briefs`, `Applications`, `Awaiting intro` — the matching workflow surfaces.
  - `Opportunities` — adds the partner columns to the Opportunity object; reached from the
    native Opportunities entry (no separate nav item, to avoid a duplicate).
  - `Partners`, `Validated partners`, `Partner applications`, `Partner content` — partner-side indexes.
- **Sidebar nav** — two folders: **Matching** (`Briefs`, `Applications`, `Awaiting intro`)
  and **Partners** (`Validated partners`, `Partner applications`, `Partners`, `Partner content`).
  Opportunities stays on Twenty's native top-level entry.
- **Seed scripts** (`src/scripts/`) — populate a fresh workspace with realistic demo data.

## Match status pipeline

`matchStatus` is a non-nullable SELECT field with a default of `TO_BE_MATCHED`. The 7 states follow the deal lifecycle:

| Status | Meaning |
| --- | --- |
| `TO_BE_MATCHED` | Default — deal entered, awaiting assignment |
| `INTRODUCED_TO_A_PARTNER` | Customer intro sent |
| `WORKING_WITH_A_PARTNER` | Engagement underway |
| `IMPLEMENTING` | Active implementation |
| `WON` | Deal closed won |
| `RECONNECT_LATER` | Paused — reconnect in future |
| `LOST` | Deal closed lost |

## Getting started

Requires a local Twenty server at `http://localhost:2020` and Node `^24.5`.

```bash
yarn install
yarn twenty dev
```

Default dev credentials: `tim@apple.dev` / `tim@apple.dev`.

Run `yarn twenty help` for the full CLI reference.

## Common commands

| Command | What it does |
| --- | --- |
| `yarn twenty dev` | Start the dev server and sync the app on file changes |
| `yarn twenty server status` | Check the local Twenty server |
| `yarn lint` / `yarn lint:fix` | Run oxlint |
| `yarn test` | Run integration tests (`vitest.config.ts`) |

## Seeding demo data

Two idempotent seed scripts. Both run via the `vitest.seed.config.ts` config that skips
the global app uninstall/reinstall.

```bash
# 1. Marketplace partners (run first — pipeline seed wires opportunities to these by slug)
yarn vitest run --config vitest.seed.config.ts src/scripts/seed-marketplace-partners.ts

# 2. Pipeline demo: 3 companies, 3 people, 15 opportunities spread across matchStatus values
yarn vitest run --config vitest.seed.config.ts src/scripts/seed-pipeline-demo.ts
```

Both scripts skip records that already exist (by `slug`, `name`, or `firstName+lastName`),
so they are safe to re-run.

## Known limitations

Current SDK gaps blocking further polish:

- Custom Partner record page layout (RECORD_TABLE has no relation scoping).
- Native Opportunities view column-order override.
- Kanban view configuration from app code (`ViewType.KANBAN` is currently ignored).
- App and field descriptions.

## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [`twenty-sdk` on npm](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
