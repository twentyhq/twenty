# TOB Twenty — Development Guide

**Author:** Saba
**Project:** TOB Twenty (TOB OS) — CRM/ERP platform built on Twenty CRM
**Purpose:** A structured guide for how to develop, test, deploy, and maintain updates to the TOB Twenty application with maximum quality control.
**Philosophy:** AI is not a replacement for human judgment — it is a powerful functional team that operates under the direction of one smart, motivated human. The human is the director, coordinator, and lead. The AI is the full functional team that executes tasks based on human commands.

---

## 1. Where We Are in the SDLC

The TOB Twenty application already exists. The infrastructure is set up. Data is migrated. We are NOT building from scratch. We are entering the project at the **Maintenance** phase — specifically the development/improvement/update sub-phase.

```
FULL SDLC:

  IDEA ──> ANALYZING/PLANNING ──> DEVELOPMENT ──> TESTING ──> DEPLOYMENT ──> MAINTENANCE
                                                                                  |
                                                                                  |
                                                                            *** WE ARE HERE ***
```

### Our Sub-Phases Within Maintenance

```
MAINTENANCE (our current phase)
  |
  +── ANALYSIS (DONE)
  |     - App architecture explored and documented
  |     - Codebase understood (frontend: 63 modules, backend: 58+ core modules)
  |     - Existing objects/data identified (Pablo migrated Subscriptions, Contracts,
  |       Customers, Contacts)
  |     - Technical stack documented
  |     - Custom objects system (metadata-driven) understood
  |     - View system, workflow engine, permission system understood
  |
  +── RECEIVING UPDATES (from Enzo — Product Owner)
  |     - Feature requests / briefings (Google Docs)
  |     - Change requests / feedback
  |     - Bug reports
  |     - Tracked in project-control.md
  |
  +── DEVELOPMENT (building the update)
  |     - Plan the task
  |     - Write code on tob-twenty/saba branch
  |     - Task-level QA (SMOKE + MAT + AT + GUI)
  |     - Optimize if needed
  |     - Regression test
  |     - AI stops after each task, waits for human review
  |
  +── FULL APPLICATION QA TEST
  |     - After development is done and before deployment
  |     - Full QA of the ENTIRE application (not just the changed part)
  |     - SMOKE TEST (all modules)
  |     - MAT on VALID DATA (all modules)
  |     - AT on INVALID DATA (all modules)
  |     - GUI verification via SCREENSHOTS (all modules)
  |     - Confirm: everything works exactly as before + the new improvement works
  |     - If regressions found → fix → re-run full test
  |     - Update QA documentation
  |     - No change is complete until the full app is verified
  |
  +── DEPLOYMENT (pushing to production)
  |     - Push to tob-twenty/saba branch on GitHub
  |     - Create/update PR to main
  |     - Human reviews changes
  |     - Merge to main
  |     - GitHub Actions builds Docker image → pushes to GHCR
  |     - Watchtower picks up new image within 5 minutes
  |     - Live on crm.tob.sh
  |
  +── VERIFICATION (post-deployment)
        - Verify changes on crm.tob.sh
        - Enzo tests and gives feedback
        - If issues → loop back to DEVELOPMENT
```

---

## 2. Technical Specification

### What the App Is Built With

**Frontend:**

| Technology | What it does |
|-----------|-------------|
| React 18 | UI framework — renders everything you see |
| TypeScript | Typed JavaScript — catches bugs at compile time |
| Jotai (+ legacy Recoil) | State management — atoms, selectors, component-scoped state |
| Emotion | CSS-in-JS — styles components using JavaScript (styled-components pattern) |
| Vite | Build tool — fast development server with hot-reload |
| Apollo Client | GraphQL client — manages API requests and caching |
| Lingui | i18n — internationalization/translations (34 languages) |

**Backend:**

| Technology | What it does |
|-----------|-------------|
| NestJS | Backend framework — modules, controllers, services |
| TypeORM | ORM — maps TypeScript classes to PostgreSQL tables |
| PostgreSQL 16 | Primary database — stores ALL CRM data |
| Redis 7 | Cache, sessions, and BullMQ job queues |
| GraphQL (Yoga) | API layer — code-first, dynamic schema generation |
| BullMQ | Background job processor — email sending, data sync |

**Infrastructure:**

| Technology | What it does |
|-----------|-------------|
| Docker | Packages the app into containers |
| Docker Compose | Runs multiple containers together (app, db, redis, worker) |
| GitHub Actions | CI/CD — builds Docker images on push to main |
| GHCR | GitHub Container Registry — stores built Docker images |
| Watchtower | Auto-deploys new images every 5 minutes |
| Cloudflare Access | Security layer in front of crm.tob.sh |
| Nx | Monorepo build system — manages dependencies between packages |
| Yarn 4 | Package manager |

### Monorepo Packages

```
packages/
  twenty-front/     # Main frontend (React) — where UI code lives
  twenty-server/    # Main backend (NestJS) — where API/business logic lives
  twenty-ui/        # Shared UI component library
  twenty-shared/    # Shared types and utilities (MUST be built first)
  twenty-emails/    # Email templates
  twenty-docker/    # Dockerfile for production builds
  twenty-e2e-testing/ # Playwright end-to-end tests
  twenty-zapier/    # Zapier integration
  twenty-sdk/       # JavaScript SDK for the API
  twenty-apps/      # Serverless functions and community integrations
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                       │
│              localhost:3001 / crm.tob.sh                 │
│                                                         │
│  63 feature modules:                                    │
│  - object-record (table, kanban, detail, filters, etc.) │
│  - auth (login, signup, OAuth)                          │
│  - views (saved views management)                       │
│  - workflow (automation UI)                             │
│  - settings (data model, permissions, API)              │
│  - ai (AI chat, agents)                                 │
│  - ... and 57 more                                      │
│                                                         │
│  State: Jotai atoms + Apollo cache                      │
│  Styling: Emotion (styled-components)                   │
│  API: Apollo Client → GraphQL                           │
└──────────────────┬──────────────────────────────────────┘
                   │ GraphQL queries/mutations
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                       │
│              localhost:3000 / crm.tob.sh                 │
│                                                         │
│  Two GraphQL endpoints:                                 │
│  - /metadata  (auth, objects, fields, views, system)    │
│  - /graphql   (workspace data — records, queries)       │
│                                                         │
│  Engine:                                                │
│  - core-modules/ (58+ system modules)                   │
│  - metadata-modules/ (dynamic schema system)            │
│  - workspace-manager/ (multi-tenant isolation)          │
│  - twenty-orm/ (custom ORM on TypeORM)                  │
│  - api/ (GraphQL + REST resolvers)                      │
│                                                         │
│  Business modules:                                      │
│  - company, person, opportunity, task, note, workflow   │
│  - messaging, calendar, timeline, attachments           │
└──────────────────┬──────────────────────────────────────┘
                   │ TypeORM queries
                   ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL 16 + Redis 7                     │
│                                                         │
│  core schema:          workspace_<uuid> schema:         │
│  - user                - workspaceMember                │
│  - workspace           - company, person                │
│  - objectMetadata      - opportunity, task, note        │
│  - fieldMetadata       - <custom objects>               │
│  - view, viewFilter    - (subscriptions, contracts...)  │
│  - role, permissions                                    │
│                                                         │
│  Redis: cache, sessions, BullMQ job queues              │
└─────────────────────────────────────────────────────────┘
```

### Key Concept: Metadata-Driven Architecture

Twenty uses metadata to generate everything dynamically. You don't write a React component per entity. You define an object in the metadata, and Twenty auto-generates:

- Database table
- GraphQL API (CRUD operations)
- UI (list view, detail page, filters, sorts, search)
- Permissions
- Webhook triggers

This means: **most features can be built via configuration (UI/API), not code. Code is only needed when the platform can't do what you need.**

---

## 3. How Updates Are Received

Updates come from **Enzo Becker** (Product Owner). He provides:

| Format | What it contains |
|--------|-----------------|
| **Briefings** (Google Docs) | Full feature specifications with requirements, user journeys, acceptance criteria |
| **Change Requests** (Google Docs/Slack) | Specific fixes, renames, enhancements to existing features |
| **Bug Reports** (Slack) | Problems found by the team using the app |

Each briefing/request is tracked in `project-control.md` as a task with status (NOT STARTED, IN PROGRESS, BLOCKED, DONE).

**Communication protocol:**
- Daily EOD summary from Saba in the project Slack channel
- Enzo is the first contact for all business logic questions
- Pablo handles data and infrastructure questions

---

## 4. Development Workflow (Per Task)

### Quality Algorithm

Every single task follows this cycle. No exceptions.

```
TASK RECEIVED (from Enzo)
       |
       v
Step 1: PLAN the task
       |  - Understand what Enzo wants
       |  - Identify which files to modify (frontend? backend? both?)
       |  - Check if Twenty can do it via configuration or needs custom code
       |  - If code needed: identify the exact modules and files
       |
       v
Step 2: WRITE the code
       |  - Work on tob-twenty/saba branch
       |  - Follow Twenty's code conventions (see Section 7)
       |  - Test locally on localhost:3001 / localhost:3000
       |
       v
Step 3: TEST — Full QA Standards
       |  - SMOKE TEST: Does the app start? Does the feature load?
       |  - MAT (Valid Data): Does it work correctly with expected input?
       |  - AT (Invalid Data): Does it reject bad input properly?
       |  - GUI: Screenshots — does it look right?
       |
       v
Step 4: OPTIMIZE (only when truly necessary)
       |  - Remove unnecessary code
       |  - Simplify complex logic
       |  - Remove duplicates
       |
       v
Step 5: RE-TEST — Full Regression Testing
       |  - SMOKE + MAT + AT + GUI
       |  - Confirm nothing broke after optimization
       |
       v
Step 6: DONE — AI STOPS, waits for human review
```

### QA Test Types

| Test Type | Full Name | What It Checks | Severity |
|-----------|-----------|---------------|----------|
| SMOKE | Smoke Test | Does the application start? Do critical paths work at all? | Critical |
| MAT | Main Application Test (Valid Data) | Does the application work correctly with valid, expected input? | Major |
| AT | Application Test (Invalid Data) | Does the application properly reject invalid, unexpected, or malicious input? | Major |
| GUI | Visual/Screenshot Test | Does the UI render correctly? Is it responsive? Does it match the design? | Major/Average |
| REGRESSION | Regression Test | After changes, does everything still work exactly as it did before? | Critical |

### Test Design Methods

| Method | Abbreviation | Purpose |
|--------|-------------|---------|
| Equivalence Partitioning | EP | Divide inputs into groups, test one from each |
| Boundary Value Analysis | BVA | Test at the edges of valid ranges |
| Decision Table Testing | DT | Test combinations of conditions |
| State Transition Testing | ST | Test valid and invalid state changes |
| Error Guessing | EG | Test common mistakes and edge cases |
| Web App Checklist | WC | Visual and functional UI verification |

---

## 5. AI Autonomy & Control Model

The AI works autonomously only on **each individual task**. It does NOT work from task to task automatically.

```
AI CONTROL FLOW:

  Task 1
       |
       AI works autonomously on Task 1
       |
       v
  Task 1 COMPLETE — AI STOPS
       |
       v
  AI asks: "Should I start Task 2?"
       |
       +──> Human reviews Task 1 output
       |         |
       |    Gives feedback / improvements
       |         |
       |    OR says "proceed"
       |         |
       |    OR says nothing (implicit approval)
       |
       v
  Task 2
       |
       AI works autonomously on Task 2
       |
       v
  Task 2 COMPLETE — AI STOPS
       |
       ... (repeat for all tasks)
```

**Why this matters:** This prevents the AI from "running away" and making decisions without human oversight. Every task completion is a checkpoint where the human can review, correct, improve, or redirect.

---

## 6. Deployment Workflow

Our scenario: **CI/CD already exists.** Deployment is NOT a separate phase — it is embedded in the development cycle.

```
DEPLOYMENT FLOW:

  Code changes on tob-twenty/saba branch (local machine)
       |
       v
  Push to GitHub
       |
       v
  Create/Update PR to main
       |
       v
  Human reviews PR
       |
       v
  Merge to main
       |
       v
  GitHub Actions automatically:
       |  - Builds Docker image (packages/twenty-docker/twenty/Dockerfile)
       |  - Bakes in REACT_APP_SERVER_BASE_URL=https://crm.tob.sh
       |  - Extracts APP_VERSION automatically
       |  - Pushes image to GHCR (ghcr.io/the-original-body/tob-twenty:latest)
       |
       v
  Watchtower on server checks every 5 minutes
       |  - Finds new image
       |  - Pulls it
       |  - Restarts containers
       |
       v
  Live on crm.tob.sh within 5 minutes of merging
```

**Important:** Pushing to main = live on production. Never push untested code. Always test locally first.

---

## 7. Code Conventions (Twenty-Specific Rules)

These are enforced across the entire codebase:

### General Rules
- **Functional components only** — no class components
- **Named exports only** — no `export default`
- **Types over interfaces** — use `type`, not `interface` (unless extending third-party)
- **String literals over enums** — except for GraphQL enums
- **No `any` type** — strict TypeScript everywhere
- **No abbreviations** — `user` not `u`, `fieldMetadata` not `fm`
- **Event handlers over useEffect** for state updates
- **Props down, events up** — unidirectional data flow
- **Composition over inheritance**

### Naming Conventions
- **Variables/functions:** camelCase
- **Constants:** SCREAMING_SNAKE_CASE
- **Types/Classes:** PascalCase (suffix component props with `Props`, e.g. `ButtonProps`)
- **Files/directories:** kebab-case with descriptive suffixes:
  - `.component.tsx` for React components
  - `.service.ts` for NestJS services
  - `.entity.ts` for TypeORM entities
  - `.dto.ts` for data transfer objects
  - `.module.ts` for NestJS modules
  - `.resolver.ts` for GraphQL resolvers

### Size Limits
- Components: under 300 lines
- Services: under 500 lines

### Comments
- Use `//` comments, not `/** */` blocks
- Explain WHY (business logic), not WHAT
- Do not comment obvious code
- Multi-line comments use multiple `//` lines

### Styling
- Use **Emotion** with styled-components pattern
- Access theme via `${({ theme }) => theme.property}`
- Import styled from `@emotion/styled`

### Utilities
- Use helpers from `twenty-shared`: `isDefined()`, `isNonEmptyString()`, `isNonEmptyArray()`
- Import order: external libraries first, then internal (`@/`), then relative

---

## 8. Testing Standards

### Task-Level Testing (during development)

After every code task, the quality algorithm applies:

```
WRITE ──> TEST (SMOKE + MAT + AT + GUI) ──> OPTIMIZE (if needed) ──> RE-TEST (REGRESSION) ──> DONE
```

### Group-Level Testing (after completing a briefing/feature)

After completing all tasks in a briefing (equivalent to a phase):

```
All tasks in Briefing X completed
       |
       v
Run FULL QA TEST (SMOKE + MAT + AT + GUI)  ──  1st time
       |
       v
Run FULL QA TEST (SMOKE + MAT + AT + GUI)  ──  2nd time
       |
       v
UPDATE QA DOCUMENTATION with:
       - Briefing name and scope
       - All test cases (ID, description, method, severity)
       - Results: PASS or FAIL for each test
       - Severity levels for any bugs found
       - Screenshots as evidence
       - Observations and known limitations
       |
       v
*** IMPORTANT: DO NOT FIX ANY BUGS AT THIS POINT ***
       |
       v
Generate TEST REPORT
       |
       v
Human REVIEWS the documentation and test report
       |
       v
Human gives COMMAND to fix (after informed review)
       |
       v
Fix bugs based on reviewed documentation
       |
       v
Re-test after fixes
```

**Critical Rule:** During testing at the end of briefings, **we do not fix any bugs — we only test and document.** The human reviews the report and gives the command to fix.

### Full Application Testing (after deployment)

After every update deployed to production:

```
FULL APPLICATION REGRESSION TEST:

  Break app into modules:
       |
       +── Authentication (login, logout, session)
       +── Object Records (list views, detail views, CRUD)
       +── Custom Objects (subscriptions, contracts, customers, contacts)
       +── Views & Filters (saved views, filter combinations)
       +── Workflows (automation triggers and actions)
       +── Settings (data model, members, API, permissions)
       +── Search (full-text search across objects)
       +── Import/Export (CSV, API bulk operations)
       |
       v
  Test each module:
       - SMOKE TEST (does it load?)
       - MAT — Valid Data (does it work correctly?)
       - AT — Invalid Data (does it reject bad input?)
       - GUI — Screenshots (does it look right?)
       |
       v
  Confirm: everything works as before + new improvement works
       |
       +── YES → Update QA documentation → Change is COMPLETE
       +── NO  → Fix regressions → Re-run full test
```

### QA Report Template

| Section | Content |
|---------|---------|
| Header | Date, Tester, Scope, Environment (local/production) |
| Summary Table | Total tests, Pass, Fail, Pass Rate — by category |
| By Severity | Critical/Major/Average/Minor breakdown |
| Test Design Methods | Which methods were used (EP, BVA, DT, ST, EG, WC) |
| SMOKE Tests | Detailed table with test ID, description, method, severity, result |
| GUI Tests | Screenshots with descriptions and pass/fail |
| MAT Tests | Valid data scenarios — detailed table |
| AT Tests | Invalid data scenarios — detailed table |
| Observations | Known limitations, not bugs but worth noting |
| Conclusion | Overall verdict, readiness for production |

---

## 9. Key Commands Reference

### Development
```bash
# Get latest changes
git pull origin main

# Start development (build shared first)
npx nx build twenty-shared
npx nx start twenty-front            # Frontend on localhost:3001
npx nx start twenty-server           # Backend on localhost:3000

# Or start everything at once
yarn start
```

### Code Quality
```bash
# Lint (only changed files — fast, always use this)
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server

# Auto-fix lint issues
npx nx lint:diff-with-main twenty-front --configuration=fix

# Type checking
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Format code
npx nx fmt twenty-front
npx nx fmt twenty-server
```

### Testing
```bash
# Run a single test file (fastest — use most often)
npx jest path/to/test.test.ts --config=packages/twenty-front/jest.config.mjs

# Run all tests for a package
npx nx test twenty-front
npx nx test twenty-server

# Run specific pattern
cd packages/twenty-server && npx jest "contract"
```

### Database
```bash
# Reset database
npx nx database:reset twenty-server

# Run migrations
npx nx run twenty-server:database:migrate:prod

# Generate a migration (after changing entity files)
npx nx run twenty-server:typeorm migration:generate \
  src/database/typeorm/core/migrations/common/add-contract-fields \
  -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata
```

### GraphQL
```bash
# Regenerate types after schema changes
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata
```

### Git / Deployment
```bash
# Switch to your branch
git checkout tob-twenty/saba

# Push changes
git push origin tob-twenty/saba

# After merging PR to main → auto-deploys within 5 minutes
```

### Local Dev Setup (Docker required)
```bash
# Start PostgreSQL and Redis
docker start twenty-postgres twenty-redis

# If containers don't exist yet:
docker run -d --name twenty-postgres -p 5432:5432 \
  -e POSTGRES_USER=twenty -e POSTGRES_PASSWORD=twenty \
  -e POSTGRES_DB=default postgres:16

docker run -d --name twenty-redis -p 6379:6379 redis:7

# Login credentials for local instance:
# Email: tim@apple.dev
# Password: tim@apple.dev
```

---

## 10. Documentation Structure

```
Saba Documentations/
│
├── Documentations/
│   ├── tob-twenty-starting-guide-about-project.md    # Project overview & context
│   ├── project-control.md                             # Task tracking (living document)
│   ├── tob-twenty-development-guide.md               # THIS document
│   └── GUIDE-FOR-PROJECT-DOCUMENTATION.md            # Universal framework/template
│
├── Screenshots/
│   └── (visual evidence from testing and bug reports)
│
├── QA/
│   ├── QA-Report-Briefing-01.md
│   ├── QA-Report-Briefing-02.md
│   ├── QA-Report-Change-Requests.md
│   └── ...
│
└── Task-Reports/
    ├── Briefing-01-Report.md
    ├── Briefing-02-Report.md
    └── ...
```

---

## 11. Complete Maintenance Cycle Visualization

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                   TOB TWENTY — MAINTENANCE CYCLE                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ENZO sends feature request / change request / bug report                    ║
║       |                                                                      ║
║       v                                                                      ║
║  PLAN the task                                                               ║
║       |  - Understand what's needed                                          ║
║       |  - Identify files to modify                                          ║
║       |  - Config or code?                                                   ║
║       |                                                                      ║
║       v                                                                      ║
║  DEVELOP (write code on tob-twenty/saba branch)                              ║
║       |  - Follow code conventions                                           ║
║       |  - Test locally on localhost:3001                                     ║
║       |                                                                      ║
║       v                                                                      ║
║  TEST (task-level QA)                                                        ║
║       |  - SMOKE TEST                                                        ║
║       |  - MAT (Valid Data)                                                  ║
║       |  - AT (Invalid Data)                                                 ║
║       |  - GUI (Screenshots)                                                 ║
║       |                                                                      ║
║       v                                                                      ║
║  OPTIMIZE (if needed) → RE-TEST (regression)                                 ║
║       |                                                                      ║
║       v                                                                      ║
║  AI STOPS — Human reviews                                                    ║
║       |                                                                      ║
║       v                                                                      ║
║  FULL APPLICATION QA TEST                                                    ║
║       |  - SMOKE TEST (all modules)                                          ║
║       |  - MAT on VALID DATA (all modules)                                   ║
║       |  - AT on INVALID DATA (all modules)                                  ║
║       |  - GUI verification via SCREENSHOTS (all modules)                    ║
║       |  - Confirm everything works as before + new improvement works        ║
║       |                                                                      ║
║       +──> Regressions? → Fix → Re-run full test                             ║
║       |                                                                      ║
║       +──> All pass?                                                         ║
║               |                                                              ║
║               v                                                              ║
║  DEPLOY                                                                      ║
║       |  - Push to tob-twenty/saba                                           ║
║       |  - Create/update PR to main                                          ║
║       |  - Human reviews PR                                                  ║
║       |  - Merge → auto-deploy to crm.tob.sh                                ║
║       |                                                                      ║
║       v                                                                      ║
║  VERIFY on production (crm.tob.sh)                                           ║
║       |                                                                      ║
║       v                                                                      ║
║  ENZO tests → feedback                                                       ║
║       |                                                                      ║
║       +──> Issues? → Loop back to DEVELOP                                    ║
║       |                                                                      ║
║       +──> Approved?                                                         ║
║               |                                                              ║
║               v                                                              ║
║  UPDATE project-control.md → Task marked COMPLETE                            ║
║       |                                                                      ║
║       +──> Next task from Enzo → Loop back to top                            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 12. Human vs AI Responsibility

| Activity | Human Does | AI Does |
|----------|-----------|---------|
| Receiving tasks | Reads Enzo's briefing, asks clarifications | Analyzes requirements, proposes approach |
| Planning | Makes final decisions on approach | Explores codebase, identifies files, creates plan |
| Development | Reviews code, tests in browser, reports issues | Writes code, follows conventions, runs local tests |
| Testing | Reviews QA reports, gives command to fix | Executes all test cases, generates reports, takes screenshots |
| Deployment | Reviews PR, approves merge | Pushes code, creates PR |
| Verification | Tests on crm.tob.sh, coordinates with Enzo | Verifies API responses, checks logs |
| Documentation | Reviews and approves docs | Writes reports, updates project-control.md |

---

## How to Use This Guide

This guide is the rulebook for all development work on TOB Twenty. Every task, every feature, every bug fix must follow the workflow defined here. The key principles:

1. **Every task follows the quality algorithm** — WRITE → TEST → OPTIMIZE → RE-TEST → DONE
2. **AI stops after each task** — human reviews before proceeding
3. **No bugs fixed during testing phase** — test and document first, fix after review
4. **Full app regression after every production deployment** — no exceptions
5. **Everything is documented** — in project-control.md, QA reports, and task reports
6. **Push to main = live on production** — never push untested code
