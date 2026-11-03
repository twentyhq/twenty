# CompanyEnrich for Twenty

[CompanyEnrich](https://companyenrich.com) is a B2B data provider with APIs for company and people research. It turns domains into structured company profiles, searches businesses and professional profiles, finds similar companies, and provides workforce information. This app brings that research into Twenty's command menu, workflows, and AI tools.

Use it to qualify accounts, research people at a target company, discover similar businesses, or refresh dedicated CompanyEnrich fields on existing CRM records. People search returns professional profiles, **not email addresses**. Person lookup starts from an email you already have.

## Setup

Requires Twenty 2.54.0+, Node.js 24.5.0–24.x or 26.5.1–26.x, Yarn 4, and your own CompanyEnrich account.

1. Install the app in your Twenty workspace. For development, run `yarn install --immutable`, authenticate the [Twenty CLI](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start) to a development workspace, and run `twenty app apply --create` from this directory.
2. Open the app's settings and set **CompanyEnrich API key**. It is a workspace secret, injected only into server-side logic functions.
3. Open **CompanyEnrich research** from the command menu. Pick an action, enter identifiers or filters, and click **Run research**.
4. To save data, select one Company or Person and open **Enrich company/person with CompanyEnrich**, then click **Enrich and save profile**. Companies need a domain; people need a known email. The global panel also accepts a Twenty record ID.

The app adds no recurring jobs or automatic paid requests. A workflow or AI tool can run an action when configured by the workspace owner.

## Available actions

Every action is available as a workflow step, an AI tool, and an authenticated HTTP route. The panel supports the same actions. Workflows expose an editable multiline `bodyJson` string for POST request fields. HTTP and AI inputs use a typed `body` object; `expand`, `waitForEnrichment`, and GET parameters stay at the top level. AI tools expose the full typed filter schema.

| Action                                 | CompanyEnrich endpoint            |
| -------------------------------------- | --------------------------------- |
| Enrich company by domain               | `GET /companies/enrich`           |
| Enrich company by properties           | `POST /companies/enrich`          |
| Batch enrich companies (1–50 domains)  | `POST /companies/enrich/batch`    |
| Get company by ID                      | `GET /companies`                  |
| Search companies                       | `POST /companies/search`          |
| Find similar companies                 | `POST /companies/similar`         |
| Count matching companies               | `POST /companies/search/count`    |
| Count similar companies                | `POST /companies/similar/count`   |
| Get company workforce                  | `GET /companies/workforce`        |
| Search professional profiles           | `POST /people/search`             |
| Look up person by known email          | `POST /people/lookup`             |
| Get person by ID                       | `GET /people`                     |
| Get person education                   | `GET /people/education`           |
| Autocomplete company domains           | `GET /companies/autocomplete`     |
| Preview companies (Scale plan)         | `POST /companies/search/preview`  |
| Preview similar companies (Scale plan) | `POST /companies/similar/preview` |

Two additional actions, **Enrich company record** and **Enrich person record**, read an existing Twenty record and save the retrieved profile. All other actions only return research results.

Search and similarity actions default to page 1 with 10 results, accept all documented filters, and support manual pagination up to 100 results per page. Company operations that support expansion accept `expand: ["workforce"]`; people search, person lookup, and get-person accept `expand: ["education"]`. Expansions are off by default and cost extra. Explicit `waitForEnrichment: false` is preserved; a 404 can mean a new domain is still being enriched. No polling or retries occur automatically.

Long-running export jobs, scroll cursors, saved-list administration, and beta email discovery are outside this synchronous CRM app. The first three require job/export lifecycle management; email discovery is a separate product from profile search. Geography helper endpoints are not separate actions; use the documented country codes and location IDs in filters.

## Examples

In the **Search companies** action's Request body field:

```json
{
  "semanticQuery": "B2B software companies selling to hospitals",
  "countries": ["US"],
  "page": 1,
  "pageSize": 10
}
```

In **Search professional profiles**:

```json
{
  "domains": ["example.com"],
  "positionQuery": ["Engineer"],
  "page": 1,
  "pageSize": 10
}
```

Paste the request object as JSON text into a workflow's **Request body (JSON)** field (`bodyJson`). HTTP and AI inputs wrap that object in `{"body": {...}}`. For example, the authenticated Twenty route `/s/companyenrich/search-people` accepts `{"body":{"domains":["example.com"],"positionQuery":["Engineer"]}}`. CompanyEnrich IDs identify provider profiles; `recordId` identifies a Twenty record. Pass numeric person IDs as strings to preserve all 64 bits.

Outputs contain `success`, the full provider `data`, and `creditsConsumed` when reported. Errors return `success: false` with a safe `error` message. In workflows, branch on `success` before using `data`. Raw arrays, count zero, scores, pagination, and metadata are preserved. Unsafe JSON integers are returned as exact decimal strings.

## CRM behavior and privacy

Record enrichment saves `companyenrichData`, `companyenrichId`, and `companyenrichEnrichedAt`. Companies also receive `companyenrichIndustry` and `companyenrichEmployeeRange`; people receive `companyenrichPosition` and `companyenrichDepartment`. These are separate from existing CRM fields. Each refresh replaces the app's snapshot, including clearing summary values missing from the latest profile.

Record-saving actions require a signed-in workspace member in Twenty's trusted execution context. They use the delegated member's CRM permissions for reads and updates; API-key-only and background invocations are rejected before reading or spending credits. Research-only actions remain available to configured workflows and API callers. The app reads a permitted record before contacting the provider; an update-permission denial can still occur after the provider has consumed credits. Its update matches both record ID and the original `updatedAt`, so a record changed during enrichment is not overwritten. The app does not create contacts, change email/phone fields, enroll records in campaigns, or send messages.

Supplied research filters/identifiers, or the selected company's website/person's known email, are sent to `https://api.companyenrich.com`. The workspace API key is also sent to CompanyEnrich in the Authorization header; it never enters the panel bundle. Requests have a 50-second timeout, reject redirects, and are not retried. Responses are limited to 8 MiB; request JSON to 256 KiB.

Research results may appear in Twenty's workflow/AI execution history under the workspace's retention settings. Saved CompanyEnrich fields persist in Twenty until cleared or the record is deleted; clear them using Twenty's normal record tools when no longer needed. Provider-side retention and deletion are described in [CompanyEnrich's privacy policy](https://companyenrich.com/privacy-policy). API requests and minimized logs are retained for up to 90 days under that policy; deletion requests go through CompanyEnrich. This app adds no separate external storage or analytics.

## Costs and support

The app itself adds no fee and does not charge Twenty credits. CompanyEnrich bills API use against your account. Counts and autocomplete are free; previews are free and require the Scale plan. Other actions and expansions consume CompanyEnrich credits. See [current pricing](https://companyenrich.com/pricing) and [endpoint documentation](https://docs.companyenrich.com/reference).

A timeout can happen after a provider request has been accepted. Check your CompanyEnrich usage before manually repeating it. For 401, check the API key; for 402, account credits; for 429, wait before another attempt.

For provider help, use [CompanyEnrich support](https://companyenrich.com/contact). Report app defects in the [Twenty issue tracker](https://github.com/twentyhq/twenty/issues).

## Development

```sh
yarn install --immutable
yarn lint
yarn typecheck
yarn test:unit
twenty app build
```

Unit and component tests use synthetic data and mocked requests, without CompanyEnrich credentials or paid calls. `yarn test` runs the installation smoke test against a disposable Twenty server using `TWENTY_API_URL`, `TWENTY_API_KEY`, and an installed Twenty CLI (or `TWENTY_CLI`).

`src/schemas/operations.json` contains the selected request schemas from CompanyEnrich's public OpenAPI v1 specification, checked against its public reference on 2026-11-02. OpenAPI nullable schemas are represented with JSON Schema `anyOf`; unknown request properties are rejected to catch misspelled filters before spending credits. Keep operation/entity UUIDs stable when updating the app.
