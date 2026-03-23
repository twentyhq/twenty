# Payment Reconciliation Infrastructure

## Overview

The Payment Reconciliation system is a Twenty App that reconciles carrier Book of Business (BOB) files against CRM policy data. It's built using the Twenty Apps SDK and runs as logic functions executed on the server.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Twenty Frontend                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Source File Actions (front-components)                 │  │
│  │  [Upload BOB] → [Re-Parse] → [Run Matching] → [Apply]│  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTP POST /s/{route}
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Twenty Server                                              │
│  ┌─────────────────────┐   ┌────────────────────────────┐   │
│  │ RouteTriggerController  │   LogicFunctionExecutor    │   │
│  │ POST /s/*           │──▶│ • Rate limiting            │   │
│  └─────────────────────┘   │ • Workspace cache lookup   │   │
│                            │ • Token generation         │   │
│                            │ • LocalDriver.execute()    │   │
│                            └────────────┬───────────────┘   │
│                                         │                   │
│  ┌──────────────────────────────────────▼───────────────┐   │
│  │ LocalDriver                                          │   │
│  │ 1. Download built code from S3                       │   │
│  │ 2. Symlink node_modules from cached layer            │   │
│  │ 3. Write bootstrap runner script                     │   │
│  │ 4. Spawn child Node.js process                       │   │
│  │ 5. Send payload via IPC, collect result              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## App Location

```
packages/twenty-apps/internal/payment-reconciliation/
├── src/
│   ├── application-config.ts      # App registration (defineApplication)
│   ├── constants/
│   │   └── universal-identifiers.ts  # All UUIDs for objects, fields, functions
│   ├── objects/                    # 7 workspace entities
│   ├── logic-functions/            # 6 logic functions (handlers)
│   ├── front-components/           # UI action buttons
│   ├── views/                      # Table/kanban view definitions
│   ├── navigation-menu-items/      # Sidebar nav structure
│   └── utils/                      # Matching engine, status engine, parsers
├── package.json
└── .twenty/output/                 # Build artifacts (gitignored)
```

## Data Model

| Object | Purpose |
|--------|---------|
| **SourceFile** | Uploaded carrier BOB file. Tracks pipeline status. |
| **NormalizedBookRow** | One parsed row from a BOB file (~25 fields). |
| **CarrierConfig** | Per-carrier parsing/matching configuration. |
| **MatchResult** | Links a BOB row → CRM Policy with confidence & method. |
| **MatchOverride** | Manual override for a specific policy match. |
| **StatusChangeLog** | Audit trail of every CRM status update applied. |
| **ReconciliationRun** | Per-run summary statistics. |

## Pipeline Flow

```
Upload BOB File
  │
  ▼ (database event trigger)
[parse-bob / parse-on-pending]
  │  Download XLSX → parse → create NormalizedBookRows
  │  Status: PENDING → PARSING → COMPLETED
  │
  ▼ (manual trigger: POST /s/match-bob)
[match-bob]
  │  9-tier matching cascade against CRM policies
  │  Status derivation, policy# discovery, two-way reconciliation
  │  Status: MATCHING → MATCHED
  │
  ▼ (human review in CRM UI)
  │  Approve/reject match results (writeBackStatus: PENDING → APPROVED)
  │
  ▼ (manual trigger: POST /s/apply-status-updates)
[apply-status-updates]
     Write approved changes to CRM policies
     Create StatusChangeLog audit records
     Status: APPLYING → DONE
```

## Logic Functions

### HTTP Route Triggers

| Function | Route | Timeout | Purpose |
|----------|-------|---------|---------|
| `match-bob` | `POST /s/match-bob` | 600s | Run 9-tier matching engine |
| `apply-status-updates` | `POST /s/apply-status-updates` | 300s | Write approved changes to CRM |
| `reparse-bob` | `POST /s/reparse-bob` | 30s | Queue a re-parse (sets status to PENDING) |

### Database Event Triggers

| Function | Trigger | Purpose |
|----------|---------|---------|
| `parse-bob` | `payReconSourceFile.created` | Parse newly uploaded BOB file |
| `parse-on-pending` | `payReconSourceFile.updated` (parseStatus→PENDING) | Parse on re-parse request |
| `recover-stuck-parsing` | Utility | Reset stuck PARSING jobs |

## Matching Engine (9-Tier Cascade)

Each BOB row is tested against CRM policies in order. First match wins.

| Tier | Method | Confidence | Description |
|------|--------|-----------|-------------|
| 1 | `OVERRIDE` | 100 | Manual override in MatchOverride table |
| 2 | `POLICY_NUMBER_DATE_AGENT` | 95 | Policy# + effective date (±30d) + agent name (85%+) |
| 3 | `POLICY_NUMBER_PLUS_EFFECTIVE_DATE` | 90 | Policy# + effective date (±30d) |
| 4 | `POLICY_NUMBER_PLUS_AGENT` | 85 | Policy# + fuzzy agent name |
| 5 | `POLICY_NUMBER_SINGLE` | 90 | Single CRM policy matching policy# |
| 6 | `POLICY_NUMBER_MULTI_BEST` | 60-92 | Multiple matches; weighted score |
| 7 | `NPN_DATE_NAME` | 60-92 | Agent NPN + effective date + name similarity |
| 8 | `NAME_DOB_DATE` | 75 | Exact DOB + name (88%+) + effective date |
| 9 | `UNMATCHED` | 0 | No match found |

After matching, two additional passes run:
- **Policy Number Discovery**: Finds real carrier policy numbers for SUBMITTED/PENDING CRM policies using DOB + fuzzy name matching
- **MISSING_FROM_BOB Detection**: Identifies active CRM policies absent from the carrier BOB

## Build & Deploy

### Development

```bash
npx twenty app:dev
```

Watches for changes and hot-reloads logic functions against a local Twenty server.

### Build

```bash
npx twenty app:build
```

1. Validates manifest (application-config + objects + logic functions)
2. Compiles TypeScript with esbuild (ESM, bundled, external packages)
3. Generates typed GraphQL client (`src/types/twenty-sdk-generated.d.ts`)
4. Typechecks the compiled output
5. Outputs to `.twenty/output/`

### Publish to Server

```bash
npx twenty app:publish --server https://crm.omniaagent.com --token $TOKEN
```

1. Builds the app (with `--tarball`)
2. Uploads tarball to server via API
3. Server extracts, syncs workspace metadata (objects, fields, views, nav items)
4. Stores built logic function code in S3

### What Happens at Runtime

When `POST /s/match-bob` is called:

1. **RouteTriggerController** receives the request
2. **RouteTriggerService** resolves workspace from host, finds the logic function by matching HTTP route path
3. **LogicFunctionExecutorService** loads the function from workspace cache, generates an app access token, builds env vars
4. **LocalDriver** downloads the built `.mjs` file from S3, symlinks `node_modules`, spawns a Node.js child process
5. The child process imports the built module, calls the handler, sends the result back via IPC
6. Response is returned to the caller

## Key Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `LOGIC_FUNCTION_TYPE` | `LOCAL` | Enables logic function execution (defaults to DISABLED in production) |
| `LOGIC_FUNCTION_LOGS_ENABLED` | `true` (recommended) | Prints logic function console output to server logs |
| `LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT` | `1000` | Max executions per TTL window |
| `LOGIC_FUNCTION_EXEC_THROTTLE_TTL` | `60000` | Throttle window in ms |

## File Storage

Built logic function code and app dependencies are stored in S3:
- **Bucket**: `twenty-crm-storage-189365142140`
- **Built code path**: `{workspaceId}/{appUniversalId}/built-logic-function/{handler}.mjs`
- **Dependencies**: `{workspaceId}/{appUniversalId}/dependencies/package.json` + `yarn.lock`

The LocalDriver caches dependencies in `/tmp/logic-function-executor-tmpdir/{yarnLockChecksum}/` on the server pod. This cache is keyed by yarn.lock checksum and persists for the pod's lifetime.

## Batch Processing

All record creation uses throttled batching to avoid overwhelming the worker queue:

| Operation | Batch Size | Delay |
|-----------|-----------|-------|
| Parse (NormalizedBookRows) | 20 | 1000ms |
| Match (MatchResults) | 20 | 100ms |
| Apply (StatusChangeLogs) | 20 | 100ms |
