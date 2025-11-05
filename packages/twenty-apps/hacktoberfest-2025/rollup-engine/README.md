# Rollup engine

General-purpose rollup engine for Twenty workspaces. The bundle ships a
serverless function that materialises aggregations from a child object onto a
parent object. The default configuration targets Opportunity → Company rollups.

## Requirements
- `twenty-cli` `npm install -g twenty-cli`
- an API key with access to your workspace. Generate one at
  `https://twenty.com/settings/api-webhooks`.
- Node 20+ (only required if you plan to run the optional smoke test locally).

## Metadata prerequisites
- Opportunity is a standard object, no extra provisioning required.
- Add these fields to the `company` object (API names shown):
  - `totalPipelineAmount` (Currency)
  - `totalOpportunityCount` (Number)
  - `wonPipelineAmount` (Currency)
  - `wonOpportunityCount` (Number)
  - `openPipelineAmount` (Currency)
  - `openOpportunityCount` (Number)
  - `lastOpportunityCloseDate` (Date)
- To script the setup, export `TWENTY_API_KEY` (and `TWENTY_METADATA_BASE_URL` if you are not targeting `http://localhost:3000/rest/metadata`) and run `yarn setup:metadata`. The helper script calls the Metadata API to ensure each field exists on the Company object, skipping anything already provisioned.

Create the fields before syncing so PATCH requests succeed.

## Quick start

1. **Deploy the app**
   ```bash
   twenty auth login
   cd rollup-engine
   twenty app sync
   ```

2. **Configure environment variables**
   - Open **Settings → Apps → Rollup engine → Configuration**.
   - Provide values for the manifest-defined keys:
     - `TWENTY_API_KEY` (required secret; create it in Twenty → Settings → API & Webhooks).
     - `TWENTY_API_BASE_URL` (optional; leave blank to use `https://app.twenty.com/rest`).
     - `ROLLUP_ENGINE_CONFIG` (optional JSON override; leave blank to use the baked-in config).
   - Save the configuration. Changes are applied immediately—no redeploy required.

3. **Verify via the Test panel**
   - Still on the app page, select **Test**.
   - Paste a JSON payload with the company ID you want to validate:

     ```json
     {
       "trigger": { "type": "databaseEvent", "eventName": "opportunity.updated" },
       "record": { "companyId": "YOUR_COMPANY_ID" },
       "opportunity": { "companyId": "YOUR_COMPANY_ID" }
     }
     ```

   - Click **Run**. You should see a success summary and the company’s rollup fields updating.

4. **Trigger live rollups**
   - Any Opportunity create/update/delete (or the nightly cron) now feeds into the Company metrics.

## Runtime configuration
- `serverlessFunctions/calculaterollups/src/rollupConfig.ts` holds the baked-in defaults.
  Override them by setting `ROLLUP_ENGINE_CONFIG` (aliases: `ROLLUPS_CONFIG`,
  `CALCULATE_ROLLUPS_CONFIG`) to a JSON array in the Configuration UI.
- `config/templates/opportunity-to-company.json` matches the default rollups shipped with the bundle.
  Copy it, tweak the object/field names you need, and paste the edited JSON into `ROLLUP_ENGINE_CONFIG`.
- `filters[].dynamicValue` currently supports `"startOfYear"` (UTC midnight on the first day of the
  current calendar year).

### Default Opportunity → Company rollups
| Parent field | Suggested type | Description |
| --- | --- | --- |
| `totalPipelineAmount` | Currency (`amountMicros`, `currencyCode`) | Sum of positive-valued Opportunities linked to the Company. |
| `totalOpportunityCount` | Number | Count of Opportunities linked to the Company. |
| `wonPipelineAmount` | Currency (`amountMicros`, `currencyCode`) | Sum of Opportunities where `stage === "CUSTOMER"`. |
| `wonOpportunityCount` | Number | Count of Opportunities where `stage === "CUSTOMER"`. |
| `openPipelineAmount` | Currency (`amountMicros`, `currencyCode`) | Sum of Opportunities where `stage !== "CUSTOMER"`. |
| `openOpportunityCount` | Number | Count of Opportunities where `stage !== "CUSTOMER"`. |
| `lastOpportunityCloseDate` | Date | Most recent `closeDate` (ISO date). |

Assumptions:
- Opportunities expose `companyId`, `amount.amountMicros`, `amount.currencyCode`,
  `stage`, and `closeDate`. Adjust filters or fields as needed via the JSON
  config.
- Amount totals are stored in micros (integers) to align with Twenty’s composite
  currency fields.

## Optional local smoke test
Run this if you want to exercise the aggregation logic without calling the live API.

```bash
cd rollup-engine
yarn install
yarn smoke
```

The smoke script replaces `fetch` with an in-memory mock, executes the rollup function using sample
Opportunity data, and asserts the PATCH payload that would be sent to Twenty.

## Troubleshooting
- **`Test your function` reports `mainFile.main is not a function`:** delete the app
  (`twenty app delete`) and sync it again (`twenty app sync`) to clear any stale bundle.
- **`status: "error", message: "Unable to parse rollup configuration override"`:** confirm that
  `ROLLUP_ENGINE_CONFIG` contains valid JSON or leave it blank to fall back to the baked-in defaults.
- **No company updates after configuring everything:** double-check the Company field API names,
  confirm the Opportunity records have `amount.amountMicros > 0`, and use the Test panel to inspect
  the summary details/logs.
