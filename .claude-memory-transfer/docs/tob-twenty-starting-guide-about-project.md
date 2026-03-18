# TOB Twenty — Starting Guide About the Project

Everything you need to know about this project, from the business context down to every technical detail.

---

## Table of Contents

1. [The Company: The Original Body (TOB)](#1-the-company-the-original-body-tob)
2. [The Problem: Island Solutions](#2-the-problem-island-solutions)
3. [The Solution: TOB OS](#3-the-solution-tob-os)
4. [What is Twenty CRM?](#4-what-is-twenty-crm)
5. [What is a Fork? What is tob-twenty?](#5-what-is-a-fork-what-is-tob-twenty)
6. [The People and Their Roles](#6-the-people-and-their-roles)
7. [The Data Pipeline: How Information Flows](#7-the-data-pipeline-how-information-flows)
8. [What is Twenty, Technically?](#8-what-is-twenty-technically)
9. [The Fork: What is tob-twenty?](#9-the-fork-what-is-tob-twenty)
10. [How Deployment Works](#10-how-deployment-works)
11. [What's Running on the Server](#11-whats-running-on-the-server)
12. [Custom Objects and the Metadata System](#12-custom-objects-and-the-metadata-system)
13. [The Three Phases](#13-the-three-phases)
14. [The Unique Identifier Problem](#14-the-unique-identifier-problem)
15. [Key Decisions from the Meeting](#15-key-decisions-from-the-meeting)
16. [The Claude Code CI Agent](#16-the-claude-code-ci-agent)
17. [How You'll Actually Work Day-to-Day](#17-how-youll-actually-work-day-to-day)
18. [Action Items from the Meeting](#18-action-items-from-the-meeting)
19. [Connection to TOB Events](#19-connection-to-tob-events)
20. [Glossary: Every Term Explained](#20-glossary-every-term-explained)

---

## 1. The Company: The Original Body (TOB)

TOB (The Original Body AG) is a Swiss company that sells health and fitness related products — specifically coaching programs, certification programs, and subscriptions. Their customers go through a journey: they first discover TOB through marketing (a webinar, an ad, a social media post), then they talk to a salesperson, then they buy a program, then they get onboarded (receive credentials, access to the TOB app, coaching sessions), and then they're active customers who might upgrade, downgrade, pause, or eventually cancel.

Every step of this customer journey was handled by a different software tool. Over the years, TOB accumulated a collection of disconnected tools.

---

## 2. The Problem: Island Solutions

Enzo Becker (the product/business lead at TOB) calls these "island solutions" — in German, "Inselloesungen." Each tool is an island that doesn't talk to the other islands. Here's what TOB was using:

| Tool | Purpose | Problem |
|------|---------|---------|
| **FunnelBox** | Marketing CRM — captures new leads, nurtures them through email sequences | Only knows about marketing. Doesn't know if someone became a customer. |
| **Close.io** | Sales CRM — tracks deals, follow-ups, closing | Doesn't know about marketing leads or contracts after sale. |
| **Bexio** | Swiss finance tool — invoices, contracts, accounting | Doesn't know about sales or marketing. Finance team uses it separately. |
| **Stripe** | Payment processing — charges credit cards | Has its own customer ID system. Knows about payments but nothing else. |
| **WordPress** | Website — has subscription data for the TOB app | Separate database. Not connected to CRM or finance. |
| **N8N** | Automation — connects tools together via workflows | Extra complexity. One more thing to maintain. |
| **Make / Zapier** | More automation tools (same as N8N, different platforms) | Even more scattered automations to maintain. |
| **Palantir Foundry** | Data platform — data pipelines, transformations, dashboards | Company is migrating away from it (expensive, complex). |
| **Gmail** | Sending individual emails to customers | Not scalable. No tracking. |
| **MariaDB** | Raw database — stores the original source-of-truth data | Raw, unprocessed. Needs transformation before it's usable. |

### Real-world pain this causes

**The duplicate person problem.** A customer uses `john@gmail.com` to sign up for a free webinar (enters FunnelBox). Then they buy a coaching program using `john.doe@company.com` (enters Close.io and Bexio). Stripe sees them as "J. Doe." WordPress has them as "johnd." Now you have four or five records for the same human being, and nobody knows they're the same person. Finance sends duplicate invoices. Customer support can't see the full history. Marketing sends the same person emails twice.

**The "where is this customer?" problem.** A customer calls and says "I didn't receive my credentials." Customer support has to check FunnelBox (are they a lead?), Close.io (did they buy?), Bexio (was the invoice sent and paid?), WordPress (do they have a subscription?), Gmail (were credentials emailed?). Each tool has a different login, different interface, different data format. It takes 20 minutes to piece together what should take 20 seconds.

**The automation spaghetti problem.** The contracting process involves automations across N8N, Make, and Zapier. A new contract comes in, one automation creates a record, another generates an invoice, another sends credentials. If the N8N server goes down, or a Make scenario errors out, the whole chain breaks. And because it's spread across three platforms, debugging is a nightmare.

**The data quality problem.** Because data is scattered, nobody has a single source of truth. Reports are unreliable. You can't answer simple questions like "how many active customers do we have?" without manually cross-referencing multiple systems.

---

## 3. The Solution: TOB OS

### The vision

Instead of 10+ separate tools, build one unified platform that handles everything — marketing, sales, contracting, invoicing, subscription management, customer support, onboarding, offboarding. One database. One interface. One source of truth.

Enzo doesn't want to call it just a "CRM" because a CRM is traditionally about customer contacts and sales. What he envisions is more like an **operating system for the entire business** — he calls it **TOB OS**. The more formal industry term would be **ERP** (Enterprise Resource Planning) — a single system that manages all business operations.

The center of TOB OS is **Twenty** — an open-source CRM platform that they can customize because they own the complete source code.

```
                          +-------------------------------------+
                          |           TOB OS (Twenty)           |
                          |                                     |
                          |  Contacts    Contracts    Invoices  |
    Raw Data --> Dexter -->  Companies   Subscriptions          |--> Listmonk (emails)
    (MariaDB)  (pipelines)|  Sales       Coaching      Notes    |--> Twilio (SMS)
                          |  Marketing   Certificates  Tasks    |--> TOB App (credentials)
                          |  Dashboards  Workflows     Reports  |--> Stripe (payments)
                          |                                     |
                          +-------------------------------------+
                                    One database.
                                    One interface.
                                    One source of truth.
```

---

## 4. What is Twenty CRM?

Twenty is an open-source alternative to Salesforce or HubSpot. It's built with modern technologies (React, NestJS, PostgreSQL, GraphQL), it's actively maintained by a full team, and most importantly — it's open source. That means TOB can:

- Run it on their own server (no vendor lock-in)
- Modify any part of the code (custom features for TOB's specific needs)
- Create custom data types (contracts, subscriptions, invoices) without waiting for a vendor
- Extend it with their own integrations
- Keep getting updates from the upstream Twenty team

Out of the box, Twenty already handles:
- **Contacts & Companies** — store and manage people and organizations
- **Opportunities** — track sales deals through a pipeline
- **Tasks & Notes** — assign work, take notes on interactions
- **Calendar integration** — sync with Google/Microsoft calendars
- **Email integration** — connect Gmail/Outlook, see email threads on contact records
- **Custom Objects** — create ANY type of data entity (Contract, Subscription, Invoice, etc.) through the UI or API
- **Custom Fields** — add fields of any type (text, number, date, currency, select, multi-select, relation, boolean, etc.)
- **Views** — filtered/sorted lists, Kanban boards, group-by views
- **Workflows** — built-in automation engine with triggers, conditions, branches, and actions
- **GraphQL API** — programmatic access to everything
- **Webhooks** — fire HTTP requests when data changes
- **Import/Export** — CSV import, API-based bulk operations
- **Search** — full-text search across all records
- **Permissions** — role-based access control, field-level permissions
- **i18n** — multi-language support
- **Self-hostable** — you can run it on your own server

What TOB needs to add is the contracting, subscription management, and specific business workflows that are unique to their business.

---

## 5. What is a Fork? What is tob-twenty?

### What is a fork?

A **fork** is a copy of someone else's software repository that you own and control.

Analogy: Imagine a publishing company releases a textbook. You photocopy the entire book. Now you have your own copy. You can write in the margins (add customizations), add new chapters (add features), cross out sections (remove things you don't need). And when the publisher releases a 2nd edition, you can get the new edition and re-apply your notes to it.

That's exactly what tob-twenty is:

- **Upstream**: `twentyhq/twenty` — the original Twenty repository, maintained by the Twenty team
- **Fork**: `the-original-body/tob-twenty` — TOB's copy, where they add their customizations

### What has TOB added on top of upstream Twenty?

1. **`deploy/` directory** — Everything needed to run Twenty on TOB's server:
   - `docker-compose.yml` — defines the services (PostgreSQL, Redis, Twenty server, Twenty worker)
   - `init-db.sql` — creates the Listmonk database on first startup
   - `setup-data-model.sh` — script that creates custom objects and fields via the GraphQL API
   - `.env.example` — template for environment variables

2. **`.github/workflows/docker-publish.yml`** — CI/CD pipeline that builds a Docker image and pushes it to GHCR whenever code is pushed to main

3. **`.github/workflows/claude.yml`** — Claude Code AI agent that responds to GitHub issues/comments

4. **Custom objects** created by `setup-data-model.sh`:
   - CommunicationLog — tracks communication events (calls, SMS, WhatsApp, email)
   - AI Profile — AI-generated profile summaries for contacts
   - Extended Person fields — listmonkUUID, marketingConsent, whatsAppStatus, emailValid

5. **`CLAUDE.md`** — Instructions for the Claude Code AI agent

### How the fork stays in sync: StGit

The fork uses **StGit** (Stacked Git) to manage customizations. Instead of making regular git commits that get mixed in with upstream code, StGit creates **patches** — small, logical changes that stack on top of the upstream code.

```
Layer 1 (bottom):  Original Twenty code (latest version from upstream)
Layer 2:           Patch: TOB deployment configuration
Layer 3:           Patch: Custom data model setup
Layer 4:           Patch: Docker publish workflow
Layer 5:           Patch: Claude Code CI integration
Layer 6 (top):     Patch: Any new customization you add
```

When the upstream Twenty team releases updates, you pull those updates and your patches get re-applied on top. This way you always know exactly what TOB modified vs. what came from upstream.

The workflow:
1. Pull upstream: `stg pull upstream main` (gets the latest Twenty code)
2. StGit re-applies your patches on top
3. If there are conflicts, you resolve them
4. Push: `git push origin main` (triggers build and deploy)

---

## 6. The People and Their Roles

### Enzo Becker — Product Owner / Business Expert

He knows **what** needs to be built. He understands the business processes because he talked to the finance department, customer support, and the onboarding team. He has a German document with all the processes documented (to be translated).

- Defines what features get built and in what order
- Provides business requirements and process descriptions
- Creates mockups and screenshots
- First point of contact for "how should this work?" questions
- Moderates communication between dev team and subject matter experts

Key quote: "I'm the first person to talk about that."

### Johannes Schulz — Technical Lead / Architect

Built the technical foundation — the fork, deployment pipeline, server infrastructure, StGit workflow. Was going on leave at the time of the meeting. The meeting was his handover.

Was more focused on Foundry migration and admitted he wasn't deeply familiar with the business process details Enzo described.

### Pablo Perez — Data Engineer / Infrastructure

Handles the data side. Gets raw data from sources, cleans it, transforms it, makes it available for Twenty. Rebuilding Foundry pipelines using **Dexter**.

Already had at the time of the meeting:
- Customer data in PostgreSQL
- Contract data in PostgreSQL
- WordPress subscription data ready
- Bexio financial data prepared (waiting on API key from Andre)

Also handles server-related work. When you need something on the server, ask Pablo.

### Mariam Garchagudashvili — Listmonk Integration

Set up Listmonk (self-hosted email marketing tool):
- Deployed Listmonk on the server
- Created API credentials
- Set up N8N workflow: Twenty person created -> N8N triggers -> Listmonk creates subscriber
- API tested and working; full end-to-end flow not fully tested
- Was going on leave with Johannes

### You (Saba) — Builder / Developer

Implement what Enzo defines:
- Configure Twenty for TOB's business needs (custom objects, fields, views)
- Work with Pablo to import data from PostgreSQL into Twenty
- Build UI customizations when needed
- Modify the fork when code changes are required
- Push to main to deploy

### Andre / Armin

Andre manages infrastructure and provides API keys. Armin is management — suggested HiROS for digital fingerprinting, wanted mockups.

### Lasha & Nico

Maintain existing N8N/Make/Zapier automations. Their work stays as-is.

---

## 7. The Data Pipeline: How Information Flows

### Step 1: Raw Data Sources

- **MariaDB** — customer records, contract records, other business data
- **WordPress database** — subscription records
- **Bexio API** — financial data (invoices, payments, accounting)
- **Stripe API** — payment transactions and customer billing
- **Close.io API** — sales data (leads, deals, communication history)

### Step 2: Dexter Processes the Data (Pablo's Job)

```
Raw Sources --> Dexter Pipelines --> PostgreSQL (clean, processed data)
```

Dexter replaces what Palantir Foundry used to do: takes raw, messy data from multiple sources, cleans it, transforms it, joins it together, and stores clean data in PostgreSQL.

The Foundry repository (`tob-foundry-migration`, a separate repo) contains pipeline definitions as JSON files that Pablo uses as reference for rebuilding in Dexter.

### Step 3: PostgreSQL to Twenty (Your Job + Pablo's)

```
PostgreSQL (processed data) --> Twenty GraphQL API --> Twenty CRM
```

Processed data gets pushed into Twenty through its GraphQL API. This can be done via Dexter pipelines directly, manual import scripts, or the setup-data-model.sh script.

### Step 4: Twenty Connects Outward

```
Twenty CRM --> Listmonk (email marketing)
           --> Twilio / WhatsApp (messaging)
           --> TOB App (credential provisioning)
           --> Webhooks (any external system)
           --> Workflows (internal automation)
```

---

## 8. What is Twenty, Technically?

### The tech stack

**Frontend:**

| Technology | What it does |
|-----------|-------------|
| **React 18** | UI framework — renders everything you see |
| **TypeScript** | Typed JavaScript — catches bugs at compile time |
| **Recoil** | State management — stores app state in atoms and selectors |
| **Emotion** | CSS-in-JS — styles components using JavaScript |
| **Vite** | Build tool — fast development server with hot-reload |
| **Apollo Client** | GraphQL client — manages API requests and caching |

**Backend:**

| Technology | What it does |
|-----------|-------------|
| **NestJS** | Backend framework — modules, controllers, services |
| **TypeORM** | ORM — maps TypeScript classes to PostgreSQL tables |
| **PostgreSQL 16** | Primary database — stores ALL CRM data |
| **Redis 7** | Cache, sessions, and job queues |
| **GraphQL (Yoga)** | API layer — code-first GraphQL |
| **BullMQ** | Background job processor — email sending, data sync |

**Infrastructure:**

| Technology | What it does |
|-----------|-------------|
| **Docker** | Packages the app into containers |
| **Docker Compose** | Runs multiple containers together |
| **GitHub Actions** | CI/CD — builds Docker images on push |
| **GHCR** | GitHub Container Registry — stores built images |
| **Watchtower** | Auto-deploys new images every 5 minutes |
| **Cloudflare Access** | Security layer in front of the server |
| **Nx** | Monorepo build system |
| **Yarn 4** | Package manager |
| **StGit** | Patch management for the fork |

### The monorepo structure

```
packages/
  twenty-front/          # Main frontend application (React)
  twenty-server/         # Main backend application (NestJS)
  twenty-ui/             # Shared UI component library
  twenty-shared/         # Shared types and utilities (MUST be built first)
  twenty-emails/         # Email templates (React Email)
  twenty-docker/         # Docker configuration and Dockerfile
  twenty-e2e-testing/    # Playwright end-to-end tests
  twenty-website/        # Documentation website (Next.js)
  twenty-zapier/         # Zapier integration
  twenty-sdk/            # JavaScript/TypeScript SDK
  twenty-apps/           # Serverless functions and community integrations
  twenty-eslint-rules/   # Custom linting rules
  twenty-utils/          # Build utilities and dev environment setup
  twenty-docs/           # Documentation source files
  twenty-cli/            # CLI tool (deprecated)
  create-twenty-app/     # Scaffolding tool for new Twenty apps
```

Build order: `twenty-shared` first, then `twenty-ui`, then `twenty-front` and `twenty-server`.

---

## 9. The Fork: What is tob-twenty?

The repository at `the-original-body/tob-twenty` is a fork of `twentyhq/twenty`.

Looking at the actual git history, these are TOB-specific commits:

```
0293ee8504 fix: add setup-buildx-action to fix GHA cache export
1f37a9b697 fix: bake APP_VERSION into Docker image at build time
fae65f06bb chore: Move Foundry migration artifacts to tob-foundry-migration repo
9ec8060e5c chore: Move zoom-folder-usage.md to tob-zoom-pipelines
6687afe104 feat: Add Foundry resource inventory and Zoom folder usage report
d6bf4dcba6 fix: Expose PostgreSQL port for external access
861045574a feat: Add fork-specific infrastructure and Foundry migration artifacts
```

Everything else comes from upstream Twenty.

---

## 10. How Deployment Works

The complete pipeline from code change to live application:

**Step 1:** You push to the `main` branch on GitHub.

**Step 2:** GitHub Actions triggers `.github/workflows/docker-publish.yml`. It ignores changes to `deploy/**` and `**.md` files.

**Step 3:** The workflow:
- Checks out the code
- Logs into GHCR
- Extracts APP_VERSION from the codebase automatically
- Builds a Docker image using `packages/twenty-docker/twenty/Dockerfile`
- Bakes in `REACT_APP_SERVER_BASE_URL=https://crm.tob.sh`
- Uses GitHub Actions cache for speed

**Step 4:** The image is pushed to GHCR as:
- `ghcr.io/the-original-body/tob-twenty:latest`
- `ghcr.io/the-original-body/tob-twenty:<short-commit-sha>`

**Step 5:** Watchtower on the server checks every 5 minutes. Finds new image, pulls it, restarts containers.

**Step 6:** Live on `crm.tob.sh` within 5-10 minutes of pushing.

No SSH. No manual restarts. Push to main = live within minutes.

### Key concepts

**Docker** packages an application and all its dependencies into a container. A Docker **image** is the blueprint. A Docker **container** is a running instance.

**Watchtower** is a program that runs on the server and checks every 5 minutes: "Is there a newer version of the image?" If yes, pulls and restarts. If no, does nothing.

---

## 11. What's Running on the Server

The server at `crm.tob.sh` runs Docker Compose with these services:

### PostgreSQL 16

- Stores ALL Twenty CRM data
- Also hosts a separate `listmonk` database
- Exposed on port 5435 externally (for Dexter pipelines to write to)
- User: `twenty`, database: `default`

### Redis 7

- Cache, sessions, and BullMQ job queues
- Memory policy: `noeviction`
- Internal only

### Twenty Server

- NestJS backend on port 3003 externally
- GraphQL API, authentication, webhooks
- Runs migrations automatically on startup
- SMTP via Mailgun (`smtp.eu.mailgun.org`)
- From: `noreply@notification.original-body.com` / "TOB CRM"
- Single workspace (multiworkspace disabled)

### Twenty Worker

- Same Docker image, command `yarn worker:prod`
- Processes background jobs (emails, data sync, async tasks)
- Does NOT run migrations or cron jobs

### Watchtower

- Checks GHCR every 5 minutes for new images

### Listmonk

- Self-hosted email marketing tool
- Uses same PostgreSQL instance (own database)
- API working, full integration not fully tested

### Cloudflare Access

- Authentication layer in front of `crm.tob.sh`
- Browser access requires Cloudflare account
- API access requires `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers

---

## 12. Custom Objects and the Metadata System

This is how you'll do most of your work.

Twenty has a **metadata-driven architecture**. You can create entirely new data types without writing code. You define the object through the UI or API, and Twenty automatically:

1. Creates a PostgreSQL table
2. Generates GraphQL types (query, mutation, filter, sort)
3. Creates API endpoints (create, read, update, delete, list)
4. Makes it available in the UI (list views, detail pages, Kanban boards)
5. Enables search, import/export, webhooks, and workflows

### Creating custom objects

**Through the UI:** Settings > Data Model > Create Object. Define name, fields, relations. Immediately available.

**Through the GraphQL API:**

```graphql
mutation {
  createOneObject(input: {
    object: {
      nameSingular: "contract"
      namePlural: "contracts"
      labelSingular: "Contract"
      labelPlural: "Contracts"
      icon: "IconFileText"
    }
  }) { id }
}
```

Then add fields:

```graphql
mutation {
  createOneField(input: {
    field: {
      objectMetadataId: "<contract-object-id>"
      name: "amount"
      label: "Amount"
      type: CURRENCY
      icon: "IconCurrencyEuro"
    }
  }) { id }
}
```

Then add relations to connect objects:

```graphql
mutation {
  createOneField(input: {
    field: {
      objectMetadataId: "<person-object-id>"
      name: "contracts"
      label: "Contracts"
      type: RELATION
      relationCreationPayload: {
        type: ONE_TO_MANY
        targetObjectMetadataId: "<contract-object-id>"
        targetFieldLabel: "Person"
        targetFieldIcon: "IconUser"
      }
    }
  }) { id }
}
```

### Available field types

| Type | What it stores | Example |
|------|---------------|---------|
| TEXT | String | "John Doe" |
| NUMBER | Numeric value | 1500.00 |
| BOOLEAN | True/false | Marketing consent: true |
| DATE_TIME | Timestamp | 2024-03-15T10:30:00Z |
| SELECT | Single choice from options | Status: "Active" |
| MULTI_SELECT | Multiple choices | Tags: ["Premium", "VIP"] |
| CURRENCY | Money with currency code | Amount: 500 EUR |
| LINK | URL | "https://example.com" |
| RELATION | Link to another object | Contract -> Person |
| EMAIL | Email address | "john@example.com" |
| PHONE | Phone number | "+41791234567" |
| RATING | Star rating | 4/5 |
| RICH_TEXT | Formatted text | Notes with bold, lists |
| ADDRESS | Physical address | Full address with components |
| ARRAY | List of values | Tags: ["tag1", "tag2"] |

### What's already been created (from setup-data-model.sh)

**CommunicationLog** — tracks communication events: channel (Call/SMS/WhatsApp/Email), direction (Inbound/Outbound), status (Queued/Sent/Delivered/Read/Failed), externalId, contentSummary, sentimentScore. Related to Person.

**AI Profile** — AI-generated summaries: profileSummary, lastUpdated. Related to Person.

**Person extensions** — listmonkUUID, marketingConsent, whatsAppStatus, emailValid.

### What's NOT built yet (your job)

Contract, Subscription, Invoice, Product/Program objects. Sales pipeline customizations. Workflow automations for the contract lifecycle.

---

## 13. The Three Phases

### Phase 1: Contracting & Subscription Management (FIRST PRIORITY)

The immediate priority. The admin and finance teams have daily problems.

Goal: manage the entire customer lifecycle in one place.

```
New Customer Signs Up
       |
Contract Created in Twenty
       |
Invoice Generated (via Bexio)
       |
Customer Pays (via Stripe)
       |
Credentials Sent (TOB app, coaching sessions)
       |
Active Subscription
       |
Changes (upgrade, downgrade, pause, extend)
       |
Offboarding (cancellation, expiry)
```

What needs to be built:
- Custom objects: Contract, Subscription, Invoice, Product/Program
- Data import: bring existing data from Pablo's PostgreSQL
- Views: filtered views for finance team
- Workflows: automate the lifecycle

### Phase 2: Sales CRM (SECOND)

Replace Close.io:
- Opportunity/Deal tracking with stages (Lead -> Contacted -> Proposal -> Negotiation -> Won/Lost)
- Kanban board view for sales pipeline
- Data migration from Close.io
- Follow-up reminders, task creation

### Phase 3: Marketing (THIRD)

Replace FunnelBox, use Listmonk:
- Full Listmonk integration
- Lead management with stages (Cold -> Warm -> Hot -> Sales Qualified)
- Email campaigns to segmented groups
- Mass email capability (5,000+)
- Analytics: open rates, click rates, conversions

---

## 14. The Unique Identifier Problem

An unsolved problem raised by Enzo.

The core issue: a single real person can appear as multiple records across different systems because they use different emails, name spellings, or contact info.

### Proposed solutions

**HiROS Digital Fingerprinting** — Armin's suggestion. Tracks website visitors with browser fingerprinting. Enzo thinks it's overkill for now.

**Stripe Customer ID** — Everyone who pays gets a `cus_xxxxx` ID. Already unique for paying customers. Doesn't cover leads who haven't paid.

**CRM-Generated ID** — Twenty assigns a UUID when a Person is created. All other systems reference this. Requires mapping from existing systems.

**Composite approach** — Most likely solution. Twenty UUID as primary, store Stripe ID / FunnelBox ID / Close.io ID as fields on Person, use matching logic to detect and merge duplicates. Twenty has a built-in merge feature for this.

Someone needs to decide. It's a foundational decision that affects everything.

---

## 15. Key Decisions from the Meeting

### N8N — Don't invest more for now

Don't build new automations on N8N. Use Dexter for data transformations and Twenty's built-in workflows for event-driven automation. Existing N8N/Make/Zapier automations stay as-is.

### Listmonk — Ready but not priority

Deployed and API works. Email marketing is Phase 3. Groundwork is there for when it's needed.

### Focus — Start with data, not UI

Immediate focus: get the data pipeline working (Postgres -> Twenty). Once data flows, build UI and workflows on top.

---

## 16. The Claude Code CI Agent

The repository has a Claude Code AI agent in `.github/workflows/claude.yml`. When someone creates a GitHub issue with `@claude` or comments `@claude` on a PR:

- Claude Code gets the full codebase
- Has access to PostgreSQL and Redis in CI
- Can edit files, run tests, builds, create PRs
- Up to 200 turns per task
- Uses the Opus model

Cross-repo support: other TOB repos can dispatch work to this repo's Claude Code instance.

MCP servers configured:
- **postgres** — direct database access
- **playwright** — browser automation
- **context7** — documentation lookup

---

## 17. How You'll Actually Work Day-to-Day

### Most of the time: no code changes needed

- Create custom objects -> Twenty UI (Settings > Data Model) or API
- Add fields -> UI or API
- Set up views (filters, sorts, Kanban) -> UI
- Import data -> GraphQL API or CSV import
- Create workflows -> UI workflow builder
- Set up webhooks -> UI

### Sometimes: code changes needed

- Custom UI that Twenty can't do out of the box
- Custom backend logic
- Modifying existing feature behavior

### When you need code changes:

1. Make changes locally
2. Test: `npx nx lint:diff-with-main twenty-front` and `npx nx typecheck twenty-front`
3. Commit and push to main
4. Wait 5-10 minutes for auto-deployment
5. Check crm.tob.sh

### Essential commands

```bash
# Get latest changes from teammates
git pull origin main

# Start development (build shared first)
npx nx build twenty-shared
npx nx start twenty-front            # Frontend
npx nx start twenty-server           # Backend

# Check your work
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Run a single test
npx jest path/to/test.test.ts --config=packages/twenty-front/jest.config.mjs

# Run all tests for a package
npx nx test twenty-front
npx nx test twenty-server

# Database operations
npx nx database:reset twenty-server
npx nx run twenty-server:database:migrate:prod

# Generate a migration (after changing entities)
npx nx run twenty-server:typeorm migration:generate \
  src/database/typeorm/core/migrations/common/add-contract-fields \
  -d src/database/typeorm/core/core.datasource.ts

# Regenerate GraphQL types after schema changes
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata
```

---

## 18. Action Items from the Meeting

| # | What | Who | When |
|---|------|-----|------|
| 1 | Translate German document to English and share | Enzo | Soon |
| 2 | Write phase-by-phase implementation plan with first tasks | Enzo | Soon |
| 3 | Give Saba + Enzo accounts for Twenty CRM | Johannes | That day |
| 4 | Share Listmonk credentials with team | Mariam | That day |
| 5 | Document Listmonk setup (done, needs testing, untested) | Mariam | That day |
| 6 | Get Bexio API key from Andre | Pablo/Andre | Pending |
| 7 | Sync to test pushing Postgres -> Twenty | Pablo, Johannes, Saba | That day/soon |
| 8 | Johannes and Mariam leave for a week | - | Next day |
| 9 | Start building based on Enzo's plan | Saba | After plan received |

---

## 19. Connection to TOB Events

TOB Events is a separate project — a mobile/web app for live events, sessions, registrations, and the event lobby. Separate codebase, separate system.

Future connection: when someone registers in TOB Events, a webhook could update their record in Twenty CRM. When customer data changes in Twenty, it could sync back to TOB Events.

Not built yet. Will use Twenty's webhook and workflow systems when the time comes.

---

## 20. Glossary: Every Term Explained

| Term | Definition |
|------|-----------|
| **CRM** | Customer Relationship Management — software for managing contacts, deals, and customer interactions |
| **ERP** | Enterprise Resource Planning — software that manages all business operations in one system |
| **Fork** | A copy of a software repository that you own and can modify independently |
| **Upstream** | The original repository a fork was copied from (`twentyhq/twenty`) |
| **StGit** | Stacked Git — tool for managing patches on top of upstream code |
| **Patch** | A small, logical change to the codebase, managed by StGit |
| **Monorepo** | A single repository containing multiple related packages/projects |
| **Nx** | Build system for monorepos — manages dependencies, builds, tests, caching |
| **Docker** | Tool that packages applications into containers for consistent deployment |
| **Docker Compose** | Tool for defining and running multi-container Docker applications |
| **GHCR** | GitHub Container Registry — where Docker images are stored |
| **Watchtower** | Tool that auto-updates Docker containers when new images are available |
| **GraphQL** | API query language that lets you request exactly the data you need |
| **TypeORM** | ORM that maps TypeScript classes to database tables |
| **NestJS** | Node.js backend framework (modules, controllers, services) |
| **Recoil** | State management library for React (atoms, selectors) |
| **Emotion** | CSS-in-JS library for styling React components |
| **Vite** | Fast frontend build tool with hot module replacement |
| **BullMQ** | Job queue library for Node.js, backed by Redis |
| **Dexter** | Data pipeline orchestration tool (replaces Foundry) |
| **Foundry** | Palantir's data platform — TOB is migrating away from it |
| **MariaDB** | Open-source relational database — TOB's raw data source |
| **PostgreSQL** | Advanced open-source relational database — used by Twenty and Dexter |
| **Redis** | In-memory key-value store — used for caching and job queues |
| **ClickHouse** | Column-oriented analytics database (optional) |
| **Listmonk** | Self-hosted email marketing tool (alternative to Mailchimp) |
| **N8N** | Self-hosted automation tool (alternative to Zapier) |
| **Bexio** | Swiss business software for accounting, invoicing, and CRM |
| **Close.io** | Cloud-based sales CRM |
| **FunnelBox** | Marketing CRM for lead generation and nurturing |
| **Stripe** | Online payment processing platform |
| **Cloudflare Access** | Zero-trust security tool that adds authentication in front of web apps |
| **MCP** | Model Context Protocol — standard for connecting AI tools to external services |
| **Custom Object** | User-defined data entity in Twenty (like Contract, Subscription) |
| **Metadata** | Data about data — in Twenty, describes what objects and fields exist |
| **Webhook** | HTTP callback — when something happens, the system sends a request to a URL |
| **Workflow** | Automated sequence of actions triggered by events |
| **Migration** | Database schema change script (creates/modifies tables, columns, indexes) |
| **Mailgun** | Email sending service (SMTP) — used by TOB for transactional emails |
| **HiROS** | Digital fingerprinting tool for identifying website visitors |
| **CI/CD** | Continuous Integration / Continuous Deployment — automated build and deploy pipeline |

---

*This document combines information from the team onboarding meeting (Enzo, Johannes, Pablo, Mariam, Saba), the CLAUDE.md project configuration, the actual codebase files (docker-compose.yml, setup-data-model.sh, docker-publish.yml, claude.yml, .mcp.json, .env.example, init-db.sql, nx.json), and the git history.*
