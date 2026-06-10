# People Data Labs enrichment app

Enriches **Person** and **Company** records with [People Data Labs](https://www.peopledatalabs.com/) (PDL) data.

> **Status: data model + enrichment mapper.** This package defines the fields, relation,
> views, role, and manifest, and implements the enrichment **logic functions** that call the
> PDL REST API and map the response onto the standard + `pdl*` fields. The manual "Enrich"
> record-action workflows are currently **created by hand** — automatic post-install seeding is
> implemented but not wired up (see [Seeded workflows](#seeded-workflows-post-install)).

---

## Enrichment logic functions

`enrich-person` / `enrich-company` (bulk workflow actions, for the manual record action) plus
`enrich-person-tool` / `enrich-company-tool` (single-record AI tools) all delegate to a shared,
trigger-agnostic core in `src/logic-functions/handlers/`:

- The workflow-action functions accept a **list of records** (`{ records, force? }`) and loop
  the single-record core over each, aggregating the outcome (`total` / `matched` / `notFound` /
  `skipped` / `errored`); a per-record failure is captured as `ERROR` without aborting the batch
  (`src/logic-functions/utils/run-batch-enrichment.ts`). The AI tools stay single-record.

- Read the record, guard against re-enriching within a TTL (`pdlLastEnrichedAt`), pick a
  match identifier (person: `pdlId` → LinkedIn → email → name; company: `pdlId` → domain →
  name), and call the PDL Person/Company Enrichment API (`src/logic-functions/utils/`).
- On a match: fill **standard fields only when empty** (never clobber user data), always
  (re)write `pdl*` fields, and set `pdlEnrichmentStatus = MATCHED`, `pdlLastEnrichedAt`,
  `pdlRawPayload` (+ `pdlLikelihood` for Person). PDL `404` → `NOT_FOUND`; other errors →
  `ERROR`. No identifier / fresh TTL → skipped with no writes.
- SELECT/MULTI_SELECT values are normalized and dropped if not in the field's option set
  (`src/logic-functions/utils/`); the option sets are the same `src/constants/*-options.ts`
  the field definitions use.

Run locally: `yarn twenty dev:function:exec -n enrich-person -p '{"records":[{"id":"<id>"}]}'`.

### Seeded workflows (post-install)

> **Not currently wired up.** `post-install.function.ts` is a no-op
> (`return { seededWorkflows: [] }`); the seeding implementation in
> `src/logic-functions/handlers/post-install.ts` (`postInstallCore`) is **not invoked**. An
> app's `CoreApiClient` only exposes per-object CRUD over the workspace `/graphql` schema, and the
> workflow-builder mutations needed to seed a workflow (`createWorkflowVersionStep` /
> `activateWorkflowVersion`) are core resolvers the app surface does not yet expose. Until the SDK
> exposes them, **create the two "Enrich" workflows by hand**.

When re-enabled, each workflow is a `MANUAL` / `BULK_RECORDS` trigger wired to a single
`LOGIC_FUNCTION` step whose `records` input is bound to the selected records
(`{{trigger.companies}}` / `{{trigger.people}}`):

- **Enrich companies** — runs `enrich-company` over the selected Companies.
- **Enrich people** — runs `enrich-person` over the selected People.

The intended seeding (`postInstallCore`) resolves each function's runtime id from its
`universalIdentifier` via the metadata API, publishes the version
(`activateWorkflowVersion`), and is **idempotent** (skips a workflow whose name already exists).

**Deferred to a later PR:** enrichment metering/billing, and auto-enrichment
triggers (on-create event + cron backfill).

---

## Data-model decisions

### Bundle scope

Only the core PDL company fields are defined. Premium / Comprehensive / specialized fields
(`inferred_revenue`, `linkedin_follower_count`, employee growth/churn/tenure, parent /
subsidiary, exec movement, top employers, `funding_details`, …) are **out of scope** for this app.

### Enums → SELECT / MULTI_SELECT

Every PDL enum that has a canonical file is a SELECT, **validated 0-missing/0-extra against
PDL schema v34.1**:

| Field                                                                                                                                                                                           | Type         | Options                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------ |
| `pdlSeniority` (`job_title_levels`, array)                                                                                                                                                      | MULTI_SELECT | 10                                         |
| `pdlFundingStages` (`funding_stages`, array)                                                                                                                                                    | MULTI_SELECT | 29                                         |
| `pdlIndustry` (`industry`)                                                                                                                                                                      | SELECT       | 147                                        |
| `pdlJobTitleSubRole` (`job_title_sub_role`)                                                                                                                                                     | SELECT       | 106                                        |
| `pdlJobTitleClass`, `pdlInferredSalary`, `pdlSex`, `pdlCompanyType`, `pdlSizeRange`, `pdlLatestFundingStage`, `pdlLocationContinent`, `pdlLocationMetro`, `pdlMicExchange`                       | SELECT       | 5 / 11 / 2 / 6 / 8 / 29 / 7 / 384 / 70     |

- Option `value`s are normalized to **GraphQL enum names** (`united states` → `UNITED_STATES`):
  uppercase, accents stripped, non-alphanumeric → `_`, digit-leading prefixed.
- Option `universalIdentifier`s are **unique per field** (shared enums like industry, metro, and
  funding stage get a separate id-set per field).
- The large option sets (`metro-options.ts`, `industry-options.ts`, …) and the UUID registry
  (`universal-identifiers.ts`) are generated from the PDL taxonomy and checked in. When
  regenerating for a newer PDL schema, **never change an existing option or field UUID** — that
  orphans stored data; only append ids for new options. `select-option-constants.spec.ts` guards
  global UUID uniqueness, value normalization, and per-field id integrity.
- **Stays `TEXT`** (no canonical PDL enum file exists): `pdlIndustryDetail` (`industry_v2`),
  `pdlJobOnetCode`. PDL `location_region` has no dedicated field — it fills the `state` slot of
  the person `pdlLocation` ADDRESS composite.

### Standard-field mapping

`pdl*` shadows are **removed** where an equivalent standard field exists; the mapper writes
the standard field instead:

| Object  | Removed shadow → standard target                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Person  | `pdlLinkedinUrl`→`linkedinLink`, `pdlJobTitle`→`jobTitle`, `pdlFullName`→`name`, `pdlWorkEmail`/`pdlPersonalEmails`→`emails`, `pdlMobilePhone`/`pdlPhoneNumbers`→`phones` |
| Company | `pdlLinkedinUrl`→`linkedinLink`, `pdlWebsite`→`domainName`, `pdlDisplayName`→`name`                                                                                       |

Shadows are **kept** where no reliable standard field is available: `pdlEmployeeCount`,
`pdlTwitterUrl`.
_Trade-off:_ PDL's work/personal-email and mobile/other-phone distinction is dropped (folded
into the standard bags).

### Location → ADDRESS composite

- **Company** location → the **standard `address`** composite (street/city/state/postcode/country/geo).
- **Person** has no standard address field → dedicated **`pdlLocation` (ADDRESS)**.
- `pdlLocationMetro` (both) and `pdlLocationContinent` (company) stay SELECT — ADDRESS has no slot.
  _Trade-off:_ ADDRESS `country` is free text, so the country SELECT was dropped.

### Current company → standard `company`

PDL's detected current employer (`job_company_*`) is resolved to a Company record
(**find-or-create**, matched by `pdlId` → domain → LinkedIn → name; created with
`name` / `domainName` / `linkedinLink` + `pdlId` / `pdlIndustry` / `pdlSizeRange` when none
matches) and linked via the **standard `company`** relation, **fill-only-if-empty** — it never
overwrites a company the user already set, and the lookup is skipped entirely when the person
already has one (no orphan companies).

Company attributes live on the **Company** record, not denormalized on the Person. The earlier
`pdlCurrentCompany` / `pdlCurrentEmployees` relation and the six `pdlJobCompany*` scalar fields
were **removed** as duplicates of the standard `company` relation and the linked Company's own
fields.

### Enrichment metadata

- `pdlId` — PDL record id (re-enrich by id: more precise than by email).
- `pdlLikelihood` (Person, NUMBER) — PDL match confidence 1–10.
- `pdlEnrichmentStatus` (SELECT: `MATCHED` / `NOT_FOUND` / `ERROR`) — distinguishes
  "no match" from "never tried" (drives re-enrichment scheduling).
- `pdlLastEnrichedAt` (DATE_TIME), `pdlRawPayload` (RAW_JSON, full response).

### Other

- `pdlTotalFunding` is `CURRENCY` (mapper must convert the bare USD float → micros).
- **Views**: a curated "People Data Labs" TABLE view per object.
- **Role**: read/update on Person & Company (object-level; tighten to field-scoped later).

---

## What the mapper does

**Orchestration** (`src/logic-functions/`)

1. Runs from the manual "Enrich" record action (`BULK_RECORDS`) or the single-record AI tools.
2. Calls the PDL Person / Company Enrichment API with `PDL_API_KEY`, passing a `min_likelihood`
   chosen by identifier strength (2 with a strong identifier, 6 for a weaker name-based match;
   overridable per call).
3. A match → `pdlEnrichmentStatus = MATCHED`; PDL `404` / no match → `NOT_FOUND`; other errors →
   `ERROR`. Errored and not-found records are also stamped with `pdlLastEnrichedAt` so the TTL
   guard backs off instead of re-submitting them on every run.
4. **TTL guard**: skips re-enrichment when `pdlLastEnrichedAt` is within 7 days (bypass with
   `force`), and prefers re-enriching by `pdlId`.

**Field writing**

5. **Standard fields** are filled **only when empty** (never clobber user data): Person `name`,
   `emails`, `phones`, `linkedinLink`, `jobTitle`; Company `name`, `domainName`, `linkedinLink`,
   `address`. All `pdl*` fields are (re)written on every match.
6. **SELECT guard**: a SELECT/MULTI_SELECT value is written only if its normalized form is in the
   field's option set; otherwise it is skipped and preserved in `pdlRawPayload` (handles PDL
   schema versions newer than the bundled one). `job_title_levels` → `pdlSeniority`,
   `funding_stages` → `pdlFundingStages`.
7. **CURRENCY**: `total_funding_raised` (USD) → `{ amountMicros: value × 1_000_000, currencyCode: 'USD' }`.
8. **ADDRESS**: PDL `location.*` is split into the composite — Company → standard `address`,
   Person → `pdlLocation`.
9. **Current company**: `job_company_*` is resolved to a Company record (find-or-create, matched by
   `pdlId` → domain → LinkedIn → name) and linked via the standard `company` relation
   (fill-only-if-empty); resolutions are cached within a batch run.
10. **Dates**: partial PDL dates (`YYYY`, `YYYY-MM`) for `job_start_date`, `last_funding_date`,
    `birth_date` are expanded and range-validated.
11. Always sets `pdlId`, `pdlLastEnrichedAt`, `pdlRawPayload` (+ `pdlLikelihood` for Person).
