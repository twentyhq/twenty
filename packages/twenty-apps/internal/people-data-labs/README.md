# People Data Labs enrichment app

Enriches **Person** and **Company** records with [People Data Labs](https://www.peopledatalabs.com/) (PDL) data.

> **Status: data-model scaffold.** This package defines the fields, relation, indexes,
> views, role, and manifest. The enrichment **logic function (the "mapper") is not yet
> implemented** — see [What the mapper must do](#what-the-mapper-must-do).

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
| `pdlIndustry` / `pdlJobCompanyIndustry` (`industry`)                                                                                                                                            | SELECT       | 147                                        |
| `pdlJobTitleSubRole` (`job_title_sub_role`)                                                                                                                                                     | SELECT       | 106                                        |
| `pdlJobTitleClass`, `pdlInferredSalary`, `pdlSex`, `pdlCompanyType`, `pdlSizeRange`, `pdlJobCompanySize`, `pdlLatestFundingStage`, `pdlLocationContinent`, `pdlLocationMetro`, `pdlMicExchange` | SELECT       | 5 / 11 / 2 / 6 / 8 / 8 / 29 / 7 / 384 / 70 |

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

### Relation

Dedicated **`pdlCurrentCompany`** (Person `MANY_TO_ONE` → Company) ↔ inverse
**`pdlCurrentEmployees`** (Company `ONE_TO_MANY` → Person). Deliberately **not** the standard
`company` relation, so PDL's detected employer can't overwrite the user's CRM account link.

### Enrichment metadata

- `pdlId` — PDL record id (re-enrich by id: more precise than by email).
- `pdlLikelihood` (Person, NUMBER) — PDL match confidence 1–10.
- `pdlEnrichmentStatus` (SELECT: `MATCHED` / `NOT_FOUND` / `ERROR`) — distinguishes
  "no match" from "never tried" (drives re-enrichment scheduling).
- `pdlLastEnrichedAt` (DATE_TIME), `pdlRawPayload` (RAW_JSON, full response).

### Other

- `pdlTotalFunding` is `CURRENCY` (mapper must convert the bare USD float → micros).
- **Indexes**: `pdlId` and `pdlLastEnrichedAt` on both objects.
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
12. **Relation**: resolve `job_company_id` → find/upsert a Company record → link `pdlCurrentCompany`.
13. **Dates**: handle partial PDL dates (`YYYY`, `YYYY-MM`) for `job_start_date`,
    `last_funding_date`, `birth_date`.
14. Always set `pdlId`, `pdlLastEnrichedAt`, `pdlRawPayload`, `pdlLikelihood` (person).
