# Import opportunity from TFT — design

**Status:** implemented + verified end-to-end on a throwaway bundle.
**Scope:** one new logic function in the partners app + a UI-built workflow in the TFT workspace.

## Goal

Let a human, while looking at an Opportunity in the **twentyfortwenty (TFT)** workspace,
press one button to copy that opportunity into the **partners** workspace. One-way, manual,
no automatic/echo sync. Replaces the earlier event-driven opportunity logic
(`on-opportunity-auto-match`, `on-opportunity-partner-assigned`) as the way opportunities
arrive in partners.

## Data flow

```
TFT Opportunity ──[Run workflow]──▶ HTTP Request action ──POST /s/opportunities──▶ partners app
   (manual trigger)                  (x-application-secret header)                 import-opportunity-from-tft
                                                                                   └─ CoreApiClient (auto-auth)
                                                                                      find-or-create → create
```

- **Trigger** lives in TFT (button on the record you're viewing) — natural "copy *this* one".
- **Receiver** is a partners-app HTTP logic function, so field mapping + auth live in versioned
  app code and `CoreApiClient` auto-authenticates to the partners workspace.

## Repo deliverable — one file (+ test)

`src/logic-functions/import-opportunity-from-tft.logic-function.ts`, modeled on
`submit-partner-application.logic-function.ts`.

### Manifest

```ts
defineLogicFunction({
  universalIdentifier: '4c220eaf-a23f-4af2-8d69-38a6c460019f',
  name: 'import-opportunity-from-tft',
  description: 'Receive one opportunity pushed from the TFT workspace and create it in partners (find-or-create company + contact, idempotent on tftOpportunityId).',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/opportunities',          // reachable at POST /s/opportunities (route-trigger.controller @Controller('s'))
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-application-secret'],
  },
});
```

### Auth

Same shared-secret guard as `submit-partner-application`: the SDK's `isAuthRequired` flag only
accepts user-session JWTs (not workspace API keys), so authenticate at the handler level by
comparing the `x-application-secret` header against the **existing** `PARTNER_APPLICATION_SECRET`
application variable. Reusing it means nothing new to set on prod.

> Note: `isNonEmptyString` is defined **locally** in the file. The `isNonEmptyString` exported
> from `twenty-sdk/define` is a conditional-availability *expression variable* (for command
> `conditionalAvailabilityExpression`), not a runtime helper — calling it at runtime throws, and
> the manifest builder rejects it. `submit-partner-application` defines the same local helper.

### Request contract (zod — single source of truth)

```ts
z.object({
  tftOpportunityId: z.string().optional(), // source id — idempotency key
  name: z.string().trim().min(1),          // required, opportunity label
  amountMicros: z.number().optional(),
  currencyCode: z.string().optional(),     // plain string on CurrencyCreateInput; defaults to 'USD'
  closeDate: z.string().optional(),        // ISO date
  stage: z.string().optional(),            // OpportunityStageEnum: NEW|SCREENING|MEETING|PROPOSAL|CUSTOMER
  company: z.object({ name: z.string().optional(), domain: z.string().optional() }).optional(),
  pointOfContact: z.object({
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }).optional(),
})
```

### Handler logic

1. **Secret guard** — reject if `x-application-secret` ≠ `PARTNER_APPLICATION_SECRET`.
2. **Validate** body with the schema; reject `invalid_input` on failure.
3. **Idempotency** — look up an opportunity by `tftOpportunityId eq` (falls back to `name eq`
   for manual calls without a source id). If one exists, return `{ ok: true, created: false, id }`
   without creating a duplicate.
4. **Company** (`findOrCreateCompanyId`) — if `company.name` given: find a Company by exact name,
   else `createCompany({ name, domainName? })`. → `companyId?`
5. **Contact** (`findOrCreatePersonId`) — if `pointOfContact.email` given: find a Person by
   `emails.primaryEmail eq`, else `createPerson({ name, emails?, companyId? })`. Name-only contacts
   are created fresh (no reliable dedup key); the opportunity guard keeps re-presses from
   duplicating them. → `pointOfContactId?`
6. **Create** the opportunity with `name`, `tftOpportunityId`, `amount?:{amountMicros,currencyCode}`,
   `closeDate?`, `stage?`, `companyId?`, `pointOfContactId?`.
7. Return `{ ok: true, created: true, id }`. On any thrown error, return `{ ok: false, reason }`.

`stage` is passed through unmodified — if the TFT and partners stage option sets ever diverge,
an unknown value is the upgrade point (handle then, not now).

### Test

`src/logic-functions/__tests__/import-opportunity-from-tft.test.ts` — pure unit test (`yarn test:unit`,
no server). Mocks `CoreApiClient` with a **class** (`vi.fn(() => obj)` is not `new`-able — the cause
of the earlier "not a constructor" failure). Covers: wrong secret → `unauthorized` (client untouched);
existing `tftOpportunityId` → `created:false`; happy path → `createOpportunity` called with the mapped
fields + resolved `companyId`/`pointOfContactId`.

## TFT side — no repo code (UI workflow)

Built once in the **TFT** workspace, documented in the logic function's file header:

1. New **Workflow**, trigger = **Manual trigger** on the **Opportunity** object (gives a
   "Run workflow" action on the record).
2. One step: **HTTP Request** action.
   - **Method:** `POST`
   - **URL:** `<partners base>/s/opportunities` (same base the website's
     `PARTNER_APPLICATION_WEBHOOK_URL` uses, path swapped to `/opportunities`).
   - **Headers:** `x-application-secret: <PARTNER_APPLICATION_SECRET>`, `Content-Type: application/json`
   - **Body:** map record fields, e.g.
     ```json
     {
       "tftOpportunityId": "{{record.id}}",
       "name": "{{record.name}}",
       "amountMicros": "{{record.amount.amountMicros}}",
       "currencyCode": "{{record.amount.currencyCode}}",
       "closeDate": "{{record.closeDate}}",
       "stage": "{{record.stage}}",
       "company": { "name": "{{record.company.name}}", "domain": "{{record.company.domainName.primaryLinkUrl}}" },
       "pointOfContact": {
         "email": "{{record.pointOfContact.emails.primaryEmail}}",
         "firstName": "{{record.pointOfContact.name.firstName}}",
         "lastName": "{{record.pointOfContact.name.lastName}}"
       }
     }
     ```

## Verification (done, on bundle `import-opp-from-tft`)

- `yarn test:unit` → 3 passing. `yarn lint` → 0/0. `yarn twenty dev --once` →
  `created logicFunction import-opportunity-from-tft`, no manifest warnings.
- Live `POST /s/opportunities` with the secret → `201 {ok:true,created:true,id}` (confirms the
  **app role can create Opportunity + Company + Person** — the one flagged risk).
- Re-POST same `tftOpportunityId` → `{ok:true,created:false, <same id>}`. Wrong secret →
  `{ok:false,reason:'unauthorized'}`.

## Out of scope

- Owner / workspace-member copy (cross-workspace member identity is not meaningful).
- Stage-enum remapping between workspaces (YAGNI until the option sets diverge).
- Any automatic / scheduled / bidirectional sync — this is manual, one-way, one record per press.
