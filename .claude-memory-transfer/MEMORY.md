# TOB Twenty — Project Memory

## Key Facts
- **Project**: TOB Twenty (TOB OS) — CRM/ERP built on Twenty CRM (open-source fork)
- **Repo**: `the-original-body/tob-twenty` (fork of `twentyhq/twenty`)
- **Live URL**: `crm.tob.sh` (behind Cloudflare Access)
- **Listmonk**: `listmonk.tob.sh/admin`
- **Working branch**: `tob-twenty/saba`
- **Local dev**: `localhost:3001` (frontend) / `localhost:3000` (backend), login: `tim@apple.dev` / `tim@apple.dev`
- **Deploy**: push to main → GitHub Actions builds Docker → GHCR → Watchtower auto-deploys within 5 min

## Key People
- **Enzo Becker**: Product Owner — defines what gets built, sends briefings
- **Pablo Perez**: Data Engineer — data pipelines, server infrastructure, also built WhatsApp Chat feature (PRs #21–#35)
- **Johannes Schulz**: Technical Lead — built the fork, deployment, CI/CD, Cloudflare Access
- **Lascha Schreier**: Automation — Funnelbox→Twenty integrations, mailing workflows, status change automations
- **Saba**: Builder/Developer — implements features, pushes code

## Current Phase
- SDLC phase: **Maintenance → Development/Improvement/Update**
- Data migration: DONE (Pablo migrated Subscriptions, Contracts, Customers, Contacts)

## Active Tasks
- Task 1: Explore Twenty CRM (DONE)
- Task 2: Briefing 01 — Subscription Management (Enzo's 5 items DONE — 11 items remaining in Section 3.1)
- Task 3: Change Requests — 11+2 items from Enzo (2 items DONE, 9 remaining)
- Task 4: Briefing 02 — Coach View / Client Profile (NOT STARTED)
- Task 5: Meeting Transcripts Viewer (DONE — PRs #47, #48 merged, Pablo approved 2026-03-15)
- Task 6: Roles & Permissions (NOT STARTED — research only, requested by Pablo 2026-03-16)

## Task 2/3 Subscription Improvements (DONE 2026-03-17)
- PRs: #52 (main feature), #54 (modal overlay fix), #55 (click-outside fix), #57 (note creation fix)
- All 6 items built, deployed, verified on crm.tob.sh:
  1. Pause form rework — modal with days, reason, notes, who activated, impact preview, note audit
  2. Pause-Days field — NUMBER field on subscription (created via UI)
  3. Final End-Date field — DATE_TIME field (created via UI)
  4. Status dropdown width — 200px → 240px (SelectInput.tsx)
  5. "Unclear" status — orange option added to Access Status (via UI)
  6. Test subscription — created for safe testing
- API tests passed: 93% (13/14 pass, 1 test script bug)
- Manual GUI tests: pending (user to verify modal, dropdown, buttons)

## Task 2 Details (Briefing 01)
- First milestone deployed and verified on crm.tob.sh (2026-03-11)
- PRs: #14 (main feature), #16 (delete mutation fix)
- Working: 3 action buttons (Pause/Extend/Payment), 5 Smart Views, 6 custom fields, timeline
- Enzo confirmed 5 items to build next (2026-03-15) — ALL DONE (2026-03-17)
- Enzo said: "go ahead with all briefed features, track everything, report daily"
- Remaining from Briefing 01 (Section 3.1): Extend workflow, Payment workflow, 14+ list columns, detail header, guardrails, linked objects, combinable filters, bulk actions, role permissions, parallel subscriptions
- Deploy scripts run via docker-compose setup-subscriptions service (Pablo's suggestion)
- Smart View filters: SELECT needs JSON arrays, IS_RELATIVE needs DIRECTION_AMOUNT_UNIT format
- GraphQL mutations: use `$id: UUID!` not `$id: ID!` for Twenty workspace API

## Master Document
- `tob-twenty-development-guide.md` is the MASTER document (the rulebook)
- Quality algorithm: WRITE → TEST (SMOKE+MAT+AT+GUI) → OPTIMIZE → RE-TEST → DONE
- Full app QA test happens AFTER development, BEFORE deployment
- AI stops after each task, waits for human review
- Daily EOD updates to Enzo expected
- **CRITICAL: Never commit/push/PR/merge without explicit human permission**

## Documentation Files (saved in memory/docs/ — keep synced)
- `docs/tob-twenty-development-guide.md` — MASTER DOCUMENT (the rulebook)
- `docs/project-control.md` — task tracking (living document, update frequently)
- `docs/tob-twenty-starting-guide-about-project.md` — project overview & context
- `docs/GUIDE-FOR-PROJECT-DOCUMENTATION.md` — universal framework/template

## Key Technical Notes
- Lingui `t` tag garbles custom string labels on production — always use plain strings for new nav items/labels (NOT `t`Transcripts``, just `"Transcripts"`). Core Twenty labels (Search, Settings) work because they're in the compiled catalog.
- Modal click-outside issue: use `ignoreContainer`, `dataGloballyPreventClickOutside`, and `shouldCloseModalOnClickOutsideOrEscape={false}`. Remove `onClose` prop if modal still closes on input click.
- Twenty Note object uses `bodyV2` (RichTextV2Metadata), NOT `body` (plain text). Use title-only notes for simple audit logging.
- Twenty auth: `cookieStorage.setItem('tokenPair', ...)` — tokens stored in cookies, not localStorage.
- Twenty GraphQL enums: use unquoted values (`PAUSED` not `"PAUSED"`) in filter/mutation arguments.
- Cloudflare Access bypass: Johannes whitelisted Coder IP (46.224.155.70). CF headers still needed for API access.
- Playwright on Coder: Chromium crashes on heavy React pages (memory issue). Use API-level testing instead of browser testing for Coder. Browser testing works from local PC.
- Windows long paths: `git config --global core.longpaths true` (required)
- GraphQL codegen: `npx nx run twenty-front:graphql:generate --configuration=metadata`

# currentDate
Today's date is 2026-03-18.
