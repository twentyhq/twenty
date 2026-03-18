# Project Control — TOB Twenty

*Last updated: 2026-03-09*

---

## Project Overview

### What is this project?

TOB Twenty is a project to build **TOB OS** — a unified business platform for The Original Body AG (TOB), a Swiss health and fitness company. It replaces multiple disconnected tools (FunnelBox, Close.io, Bexio, Stripe, WordPress, N8N, Make, Zapier) with one system built on **Twenty CRM**, an open-source CRM platform.

### Why does it exist?

TOB was using 10+ separate tools that don't talk to each other. Customer data was scattered everywhere — marketing in FunnelBox, sales in Close.io, finance in Bexio, payments in Stripe, subscriptions in WordPress. Nobody had the complete picture of a customer in one place. This caused duplicate records, broken automations, manual work, and daily problems for the finance and support teams.

### What is the end goal?

One platform where the team can:
- See every customer and their full history in one place
- Manage contracts, subscriptions, invoicing, and onboarding
- Track sales pipeline and marketing leads
- Automate business processes (contract -> invoice -> payment -> access)
- Replace all the disconnected tools with a single system

### Key people

| Person | Role | What they do |
|--------|------|-------------|
| **Enzo Becker** | Product Owner | Defines what gets built, provides business requirements, first contact for all business questions |
| **Pablo Perez** | Data Engineer | Migrates data from raw sources into Twenty, handles server/infrastructure, builds Dexter pipelines |
| **Johannes Schulz** | Technical Lead | Built the infrastructure (fork, deployment, CI/CD), reference for deep technical questions |
| **Saba (you)** | Builder / Developer | Implements features in Twenty, creates data models, builds UI, pushes changes live |
| **Mariam** | Listmonk setup | Set up email marketing tool (Listmonk), currently on leave |

### Key URLs

| What | URL |
|------|-----|
| Twenty CRM (live) | `crm.tob.sh` |
| Twenty CRM (local dev) | `localhost:3001` (frontend) / `localhost:3000` (backend) |
| Listmonk (email marketing) | `listmonk.tob.sh/admin` |
| GitHub repo | `github.com/the-original-body/tob-twenty` |
| Working branch | `tob-twenty/saba` |

### Development workflow

Code changes -> push to `tob-twenty/saba` branch -> create PR to main -> merge -> auto-deploys to `crm.tob.sh` within 5 minutes via Watchtower.

### Local dev setup

Requires Docker Desktop running (PostgreSQL + Redis containers), then start backend and frontend separately. Login: `tim@apple.dev` / `tim@apple.dev`.

---

## Task 1: Explore the Twenty CRM Application

| Field | Value |
|-------|-------|
| **Status** | DONE |
| **Priority** | High |
| **Assigned to** | Saba |
| **Started** | 2026-03-06 |

### What is this task?

Explore the Twenty CRM at `crm.tob.sh` and `localhost:3001` to understand what exists, what each section does, and where things are. This is needed before building anything.

### What to explore

| Section | Where to find it | What to look at |
|---------|-----------------|-----------------|
| People | `/objects/people` | Built-in contact records — names, emails, phones, companies |
| Companies | `/objects/companies` | Organizations |
| Opportunities | `/objects/opportunities` | Sales deals with pipeline stages |
| Tasks | `/objects/tasks` | To-do items, assignable to team members |
| Notes | `/objects/notes` | Free-text notes linked to contacts/companies |
| Search | Top bar | Full-text search across all records |
| Data Model | Settings > Data Model | All objects and fields — standard and custom |
| API & Webhooks | Settings > API & Webhooks | API keys, webhook configuration |
| Members | Settings > Members | Team members and roles |

### What already exists in Twenty

**Built-in objects (from Twenty):**
- People, Companies, Opportunities, Tasks, Notes
- Email and Calendar integration support
- Search, Permissions, Workflows

**Custom objects (added by TOB via setup-data-model.sh):**
- CommunicationLog — tracks calls, SMS, WhatsApp, emails with channel, direction, status
- AI Profile — AI-generated profile summaries per person
- Person extended with: listmonkUUID, marketingConsent, whatsAppStatus, emailValid

**Objects created by Pablo (data migration done 2026-03-07):**
- Subscriptions
- Contracts
- Customers
- Contacts

---

## Task 2: Customer List Dashboard + Subscription Management (Briefing 01)

| Field | Value |
|-------|-------|
| **Status** | NOT STARTED |
| **Priority** | High |
| **Assigned to** | Saba |
| **Requested by** | Enzo Becker |
| **Briefing doc** | [Briefing 01 — Google Doc](https://docs.google.com/document/d/1B602uqZ2yp7eXqZFODyUbPjB9mDrQIHEpIUhMGGCODo/edit?usp=sharing) |
| **Data migration** | DONE — Pablo completed it on 2026-03-07 |

### What is this task?

Build a dashboard where the backoffice team can:

1. **See all customers and their subscriptions** in one filterable list
2. **Click on a subscription** and see everything about it — status, dates, payments, history
3. **Take actions** — pause a subscription, extend it, renew it, change payment plans
4. **Save filtered views** — like "Overdue payments" or "Expiring in 60 days"
5. **See a timeline** of every change that happened to a subscription (audit trail)

### Who will use it?

| Team | How they use it |
|------|----------------|
| **Customer Ops / Backoffice** | Primary users — daily operations, manage subscriptions, handle customer requests |
| **Finance** | Payment status, overdue tracking, collections |
| **Sales** | Renewal upselling, contract follow-up |

### User journeys

**A: "Work my list"** — Open dashboard, select saved view, see list, click row, take action, move to next.

**B: "Pause for 4 weeks"** — Search customer, open subscription, select Pause, enter dates/reason, preview impact, confirm, audit logged.

**C: "Extend / Renew"** — Open subscription, select Extend, enter term and pricing, link contract, end date updated.

**D: "Change payment plan"** — Open subscription, edit payment mode/schedule, flags for finance.

**E: "Parallel subscriptions"** — Customer buys another product, separate subscription created, both visible.

### Dashboard requirements

**Columns:** Customer Name, Email, Subscription Type, Status, Contract Signed/Start/End Dates, Program Start, Payment Status, Offer/Discount, Access Status, Last Touchpoint, Next Action, Owner.

**Filters:** Date ranges, status filters, product filters, operational ("needs action", "no touchpoint in X days").

**Smart Views:** "Access not granted", "Expiring in 60 days", "Paused", "Overdue payments", "No touchpoint in 14 days".

**Detail view:** Summary header, action buttons, timeline/audit log, linked contracts/invoices.

### Rules (non-negotiable)

- Every change creates an immutable audit log entry
- Can't pause an ended subscription, can't create negative end dates
- Pause duration limits (configurable)
- Renewal must reference a contract
- Permission-based actions

### Step-by-step execution plan

| Step | What | Who | Status |
|------|------|-----|--------|
| 1 | Data migration into Twenty | Pablo | DONE |
| 2 | Review Pablo's schema — check objects and fields | Saba | NOT STARTED |
| 3 | Add missing fields from Enzo's briefing | Saba | NOT STARTED |
| 4 | Create saved views and filters (Smart Views) | Saba | NOT STARTED |
| 5 | Build action workflows (Pause, Extend, Renew, Payment plan change) | Saba | NOT STARTED |
| 6 | Build audit trail / timeline for subscription events | Saba | NOT STARTED |
| 7 | Set up permissions (Admin vs Standard roles) | Saba | NOT STARTED |
| 8 | Test with Enzo and backoffice team | Saba + Enzo | NOT STARTED |
| 9 | Iterate based on feedback | Saba | NOT STARTED |

### Definition of done

- Filter customers/subscriptions and save Smart Views
- Execute Pause with preview + audit
- Execute Extend/Renew with end date recalculation + audit
- Execute Payment plan change
- See all changes in timeline
- Basic permissions exist (Admin vs Standard)
- List works at scale (thousands of records)

---

## Task 3: Change Requests (11 items)

| Field | Value |
|-------|-------|
| **Status** | NOT STARTED |
| **Priority** | Medium-High |
| **Assigned to** | Saba |
| **Requested by** | Enzo Becker |
| **Briefing doc** | [Change Requests — Google Doc](https://docs.google.com/document/d/16vvOmqaEsEExDalp3DOieU15GKZ-L94PBdmvk0tOIX0/edit?usp=sharing) |

### What are these?

Specific feedback and feature requests from Enzo on what Pablo already built. 11 items ranging from quick renames to complex features.

| # | Request | Complexity | Status |
|---|---------|-----------|--------|
| 1 | Rename "TOB Subscriptions" to "Subscriptions" (same for all objects) | Simple | NOT STARTED |
| 2 | Custom ID naming convention (e.g. "BPA239403" — product type + number) | Medium | NOT STARTED |
| 3 | Better filters with AND/OR conditions and groups | Complex | NOT STARTED |
| 4 | Backend field names vs UI display names should be different | Medium | NOT STARTED |
| 5 | Create 3 test data entries per object | Simple | NOT STARTED |
| 6 | Contract views with pre-filtered subviews (new contracts, cancellation requests) | Medium | NOT STARTED |
| 7 | Bulk action buttons (select multiple records, perform action) | Complex | NOT STARTED |
| 8 | Prominent action buttons in detail view ("restrict App Access", "cancel contract") | Medium | NOT STARTED |
| 9 | Timeline filtering by type (email, zoom, call) | Medium | NOT STARTED |
| 10 | Contract creation dashboard (replace Google Form, prefill from contact) | Complex | NOT STARTED |
| 11 | Bulk contract creation (pre-generate 1000 contracts with DocuSeal) | Complex | NOT STARTED |

---

## Task 4: Coach View — Client Profile (Briefing 02)

| Field | Value |
|-------|-------|
| **Status** | NOT STARTED |
| **Priority** | Critical (daily operational impact on coaches) |
| **Assigned to** | Saba |
| **Requested by** | Enzo Becker |
| **Briefing doc** | [Briefing 02 — Google Doc](https://docs.google.com/document/d/1jvB8kMifZhVuwe79rrbke0zmKUDiVb-XrXNT66pyqaQ/edit?usp=sharing) |

### What is this task?

Build a **Client Profile** module in TOB-OS — a single, unified view of every coaching client that pulls data from all platforms into one place. This replaces the current fragmented setup where coaches search across multiple disconnected tools.

### The problem it solves

Client data is scattered across:

| Platform | Data Type | Current Access |
|----------|----------|----------------|
| TOB-OS / App | Session scheduling, group recordings | All coaches |
| Zoom (individual) | Individual session recordings, transcripts | Restricted |
| AI Structure Analysis | Client analysis results | Restricted |
| WhatsApp | Chat history, images, check-ins | Restricted |
| Media uploads | Client images and videos | Restricted |
| Google Docs | Manual coach notes | Restricted |

"Restricted" means not all coaches can see it. When a client is reassigned, the new coach has no visibility into what the client already submitted. Coaches waste time searching, and clients get asked to re-submit things — damaging trust.

### What needs to be built

**Client Profile page with these sections:**

| Section | Content |
|---------|---------|
| Client Master Data | Name, contact, assigned coach, start date, goals |
| Activity Timeline | Chronological feed of ALL touchpoints across all platforms |
| Session History | Individual and group sessions with date, duration, topic, recording, transcript |
| Uploaded Content | All client files (AI analyses, images, videos) regardless of upload source |
| Recordings | Individual session recordings from TB Drive, permanently linked |
| Transcript Summaries | Auto-extracted key insights per session |
| Coach Notes | Structured free-text for manual additions |
| Handover Protocol | Summary for successor coaches |

**Activity Timeline touchpoints:**
- Coaching sessions (individual + group) with recording/transcript links
- Content submissions (AI analyses, images, videos) tagged by source
- WhatsApp messages (if technically feasible)
- Homework/exercise assignments and completions
- Check-in events
- Coach assignments and reassignments
- Goal setting, updates, milestone markers

### Technical prerequisites (enablers)

| Enabler | What | Status |
|---------|------|--------|
| Cross-platform data aggregation | Pull data from Zoom, WhatsApp, AI tool, media uploads into one profile | Open questions |
| Long-term recording archival | Auto-archive individual Zoom recordings (expire after 30 days) to TB Drive | Open questions |
| Automated transcript processing | Auto-extract and structure Zoom transcripts per session | Open questions |

### Open technical questions

| Question | Status |
|----------|--------|
| WhatsApp integration: API feasible or manual relay only? | Open |
| AI Structure Analysis: data format and export path? | Open |
| Which media upload entry points exist? Can they route to central store? | Open |
| How are individual Zoom accounts connected (OAuth/API)? | Open |
| Which tool handles automated transcript summarisation? | Open |
| Which timeline touchpoints at MVP vs later? | Open |

### Implementation phases

**Phase 1 — Unified Profile & Recording Foundation:**
- Build Client Profile view in TOB-OS
- Activity Timeline with session-level touchpoints + manual entry
- TB Drive connection for permanent recording archival
- Automated transcript retrieval and summaries
- Centralise AI Structure Analysis results
- Replace manual Google Docs workflow

**Phase 2 — Full Data Aggregation & Intelligence:**
- WhatsApp integration
- Universal media upload hub
- AI-generated coaching insights (patterns, progress signals)
- Automated pre-session briefs
- Selective client access (optional)

### Acceptance criteria

- Unified Client Profile exists and is accessible to all coaches
- Each client has their own profile with data from all connected platforms
- Activity Timeline shows complete, filterable log across platforms
- All client-submitted content visible in one place
- Coaches can add notes and handover protocols
- Individual session recordings permanently archived and linked
- Zoom transcripts auto-processed into structured summaries
- Manual Google Docs process fully replaced

---

## Future Tasks (Known but not started)

| Task | Phase | Status | Notes |
|------|-------|--------|-------|
| Sales CRM — replace Close.io | Phase 2 | NOT STARTED | Sales pipeline, opportunity tracking, Kanban views |
| Marketing — Listmonk integration | Phase 3 | NOT STARTED | Email campaigns, lead nurturing, mass emails. Listmonk already deployed. |
| Unique identifier solution | TBD | NOT STARTED | Solve the duplicate person problem across systems |
| Migrate existing N8N/Make/Zapier automations | TBD | POSTPONED | Decision: leave as-is until there's a specific problem |

---

## Summary

### Current state (2026-03-09)

- **Twenty CRM** is deployed and running at `crm.tob.sh`
- **Local dev server** working at `localhost:3001` (frontend) / `localhost:3000` (backend)
- **Listmonk** deployed at `listmonk.tob.sh/admin`
- **Data migration DONE** — Pablo migrated Subscriptions, Contracts, Customers, Contacts on 2026-03-07
- **Infrastructure complete** — CI/CD pipeline, Docker, auto-deployment working
- **Branch created** — `tob-twenty/saba` on GitHub, ready for development
- **Enzo expects daily EOD updates** in the project channel

### Active tasks

| Task | Status | Notes |
|------|--------|-------|
| Task 1: Explore Twenty CRM | DONE | Completed 2026-03-09 |
| Task 2: Briefing 01 — Dashboard + Subscription Management | NOT STARTED | Data is in, ready to start |
| Task 3: Change Requests (11 items) | NOT STARTED | Quick wins possible |
| Task 4: Briefing 02 — Coach View / Client Profile | NOT STARTED | Big feature, many open technical questions |

### What's no longer blocked

- Data migration — DONE by Pablo
- Local dev server — WORKING

### What's still needed

| Need | From whom | Status |
|------|----------|--------|
| Cloudflare Access credentials (for Claude API access) | Pablo | Not needed — we work through code changes + deployment |
| Answers to Coach View technical questions (WhatsApp, Zoom API, etc.) | Enzo / Pablo | NOT ASKED YET |
| Enzo's feedback after first milestone | Enzo | FUTURE |

### Key communication

- **Enzo** provides requirements and feedback — daily EOD summary expected from Saba
- **Pablo** handles data and infrastructure — data migration done
- **Saba** builds features — code changes locally, push to branch, merge to deploy
