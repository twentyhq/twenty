# People Data Labs enrichment app

Enriches **Person** and **Company** records with [People Data Labs](https://www.peopledatalabs.com/) (PDL) data.

> **Status: data model + enrichment mapper + seeded workflows.** This package defines the
> fields, relation, views, role, and manifest, implements the enrichment **logic
> functions** that call the PDL REST API and map the response onto the standard + `pdl*`
> fields, and seeds the manual "Enrich" record-action workflows on install.

---

## Enrichment logic functions

`enrich-person` / `enrich-company` (bulk workflow actions, for the manual record action) plus
`enrich-person-tool` / `enrich-company-tool` (single-record AI tools) all delegate to a shared,
trigger-agnostic core in `src/logic-functions/handlers/`:

- The workflow-action functions accept a **list of records** (`{ records, force? }`) and loop
  the single-record core over each, aggregating the outcome (`total` / `matched` / `notFound` /
  `skipped` / `errored`); a per-record failure is captured as `ERROR` without aborting the batch
  (`src/logic-functions/utils/run-bulk-enrichment.ts`). The AI tools stay single-record.

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

`post-install.function.ts` runs once on install and creates two ready-to-use
enrichment workflows so the action is available out of the box:

- **Enrich companies** — manual trigger available when one or more Companies are
  selected → bulk-enriches them via `enrich-company`.
- **Enrich people** — manual trigger available when one or more People are
  selected → bulk-enriches them via `enrich-person`.

Each workflow is a `MANUAL` / `BULK_RECORDS` trigger wired to a single
`LOGIC_FUNCTION` step whose `records` input is bound to the selected records
(`{{trigger.companies}}` / `{{trigger.people}}`). With `BULK_RECORDS` the action
appears whenever one or more records are selected, and a single workflow run hands
the whole selection to one function call. The post-install resolves each function's
runtime id from its `universalIdentifier` (via the metadata API), publishes the
version (`activateWorkflowVersion`) so the record action appears, and is
**idempotent** — it skips a workflow whose name already exists
(`src/logic-functions/handlers/post-install.ts`).

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
- Option `universalIdentifier`s are **unique per field** (shared enums like industry get a
  separate id-set per field).
- **Stays `TEXT`** (no canonical PDL enum file exists): `pdlIndustryDetail` (`industry_v2`),
  `pdlJobOnetCode`, `pdlLocationRegion`.

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

## What the mapper must do

The logic function (to be built) must:

**Orchestration**

1. Trigger via manual command-menu action / record create / batch (TBD).
2. Call PDL Person and/or Company Enrichment with `PDL_API_KEY`; pass `min_likelihood` /
   `required_fields` to control match quality.
3. On `200` → write fields + set `pdlEnrichmentStatus = MATCHED`; on `404` →
   `NOT_FOUND`; on error → `ERROR`.
4. Respect PDL rate limits (queue / throttle on `429`).
5. **TTL guard**: skip re-enrichment if `pdlLastEnrichedAt` is recent; prefer re-enriching by `pdlId`.

**Field writing**

6. Write **standard fields** (fill-only-if-empty to avoid overwriting user data):
   Person `name`, `emails`, `phones`, `linkedinLink`, `jobTitle`; Company `name`,
   `domainName`, `linkedinLink`, `address`.
7. Write `pdl*` fields for everything else.
8. **SELECT guard**: only write a SELECT/MULTI_SELECT value if the normalized value exists in
   the field's option set; otherwise skip and keep it in `pdlRawPayload` (handles PDL schema
   versions newer than v34.1). Use the same normalization as the option `value`s.
9. **MULTI_SELECT** arrays: `job_title_levels` → `pdlSeniority`; `funding_stages` → `pdlFundingStages`.
10. **CURRENCY**: `total_funding_raised` (USD float) → `{ amountMicros: value × 1_000_000, currencyCode: 'USD' }`.
11. **ADDRESS**: split PDL `location.*` into the composite — Company → standard `address`,
    Person → `pdlLocation`.
12. **Company**: resolve `job_company_*` → find-or-create a Company record → link the standard
    `company` relation (fill-only-if-empty).
13. **Dates**: handle partial PDL dates (`YYYY`, `YYYY-MM`) for `job_start_date`,
    `last_funding_date`, `birth_date`.
14. Always set `pdlId`, `pdlLastEnrichedAt`, `pdlRawPayload`, `pdlLikelihood` (person).
