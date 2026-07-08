# Salesforce Migration

**Move your CRM from Salesforce to Twenty with a migration that tells you exactly what it will do before it does it, and shows you everything while it runs.**

## ✨ What you get

- **Automatic analysis** — the app inspects your Salesforce org and builds a migration plan: which objects, how many records, which fields map where, and which relations are preserved
- **Full transparency before anything is written** — review the plan (record counts, field mappings, relation notes, warnings), then start the migration with one click
- **Live progress** — per-object progress bars, created / updated / failed counters updating in real time, plus a `Salesforce Migrations` view in your workspace
- **Idempotent and resumable** — every record is upserted by its Salesforce Id, so re-running a migration updates records instead of duplicating them; interrupted runs resume exactly where they stopped
- **Serious error handling** — failed records are stored individually with the original Salesforce data and the error message; transient API errors are retried with backoff; you can pause, resume, or cancel at any time

## 🔁 What gets migrated

| Salesforce | Twenty | Relations |
| --- | --- | --- |
| Accounts | Companies | — |
| Contacts | People | Account → Company |
| Leads (unconverted) | People | — |
| Opportunities | Opportunities | Account → Company |
| Tasks | Tasks | Who/What → People, Companies, Opportunities |
| Notes (classic) | Notes | Parent → People, Companies, Opportunities |

Opportunity stages are mapped heuristically to Twenty's pipeline; the original Salesforce stage is always preserved in a dedicated `Salesforce Stage` field. Every migrated record keeps its `Salesforce Id`.

## 🚀 How it works

1. Open the command menu and run **Migrate from Salesforce**
2. The wizard tests the connection and lets you pick the objects to migrate
3. **Analyze** builds the plan from your live org: review counts, mappings, and warnings
4. **Start migration** — a background worker processes records in batches and streams progress to the wizard and to the `Salesforce Migrations` views

## ⚙️ Setup (server admin)

The app connects to Salesforce with the OAuth 2.0 Client Credentials flow:

1. In Salesforce Setup, create a **Connected App** with *Enable OAuth Settings* and *Enable Client Credentials Flow*, scope `api`, and assign a run-as integration user with read access to the objects you want to migrate
2. In Twenty, open the app's settings and fill in `SALESFORCE_INSTANCE_URL` (your My Domain URL), `SALESFORCE_CLIENT_ID`, and `SALESFORCE_CLIENT_SECRET`

See [SETUP.md](./SETUP.md) for the detailed walkthrough.

## 💳 Billing

**Free** — no credits, no metering. Salesforce API calls count against your Salesforce org's API limits (roughly one API call per 200 records, plus lookups).

## 📌 Heads up

- Record owners are not mapped to workspace members yet; migrated records are created by the app
- ContentNotes (enhanced notes), attachments, cases, campaigns, and custom objects are not migrated in this version
- Twenty's default pipeline has no "Closed Lost" stage: closed-lost opportunities land in `New` with their original stage kept in `Salesforce Stage`
- Phone numbers are imported as raw text without country-code parsing
