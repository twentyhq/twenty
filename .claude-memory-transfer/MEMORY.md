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
- **Johannes Schulz**: Technical Lead — built the fork, deployment, CI/CD
- **Lascha Schreier**: Automation — Funnelbox→Twenty integrations, mailing workflows, status change automations
- **Saba**: Builder/Developer — implements features, pushes code

## Current Phase
- SDLC phase: **Maintenance → Development/Improvement/Update**
- Data migration: DONE (Pablo migrated Subscriptions, Contracts, Customers, Contacts)
- Local dev server: WORKING (required Docker + long paths fix + workspaceMember seeding)

## Active Tasks
- Task 1: Explore Twenty CRM (DONE)
- Task 2: Briefing 01 — Subscription Management (BUILDING NEXT — Enzo confirmed 3 items: Pause rework, Pause-Days, Final End-Date)
- Task 3: Change Requests — 11+2 items from Enzo (2 items confirmed: status dropdown, "unclear" status)
- Task 4: Briefing 02 — Coach View / Client Profile (NOT STARTED)
- Task 5: Meeting Transcripts Viewer (DONE — PRs #47, #48 merged, Pablo approved 2026-03-15)
- Task 6: Roles & Permissions (NOT STARTED — research only, requested by Pablo 2026-03-16)

## Task 2 Details (Briefing 01)
- First milestone deployed and verified on crm.tob.sh (2026-03-11)
- PRs: #14 (main feature), #16 (delete mutation fix)
- Working: 3 action buttons (Pause/Extend/Payment), 5 Smart Views, 6 custom fields, timeline
- Enzo confirmed 5 items to build next (2026-03-15):
  1. Pause rework — popup form with days, reason, notes, who activated (from Briefing 01)
  2. Pause-Days — new data field on subscription (from Briefing 01)
  3. Final End-Date — calculated: periods bought PLUS pause periods (Enzo corrected: PLUS not minus)
  4. Status dropdown too narrow — expand so names aren't cut off (Change Request)
  5. "unclear" status — add for all existing subscriptions (Change Request)
- Enzo said: "go ahead with all briefed features, track everything, report daily"
- Deploy scripts run via docker-compose setup-subscriptions service (Pablo's suggestion)
- Smart View filters: SELECT needs JSON arrays, IS_RELATIVE needs DIRECTION_AMOUNT_UNIT format
- Delete mutation: use $id: String! not $id: ID! for Twenty API
- Current Pause: fixed 4-week, simple confirmation, sets accessStatus→PAUSED, extends endDate by 28 days
- Pablo already done: new subscription IDs with product prefix, granted programs, linked subscriptions↔contracts

## Master Document
- `tob-twenty-development-guide.md` is the MASTER document (the rulebook)
- Quality algorithm: WRITE → TEST (SMOKE+MAT+AT+GUI) → OPTIMIZE → RE-TEST → DONE
- Full app QA test happens AFTER development, BEFORE deployment
- AI stops after each task, waits for human review
- Daily EOD updates to Enzo expected

## Documentation Files (saved in memory/docs/ — keep synced)
- `docs/tob-twenty-development-guide.md` — MASTER DOCUMENT (the rulebook)
- `docs/project-control.md` — task tracking (living document, update frequently)
- `docs/tob-twenty-starting-guide-about-project.md` — project overview & context
- `docs/GUIDE-FOR-PROJECT-DOCUMENTATION.md` — universal framework/template
- **Rule: Always ask "Should I save to memory?" before updating these. Only save after permission.**

## Key Technical Notes
- Lingui `t` tag garbles custom string labels on production — always use plain strings for new nav items/labels (NOT `t`Transcripts``, just `"Transcripts"`). Core Twenty labels (Search, Settings) work because they're in the compiled catalog.
- Windows long paths: `git config --global core.longpaths true` (required)
- Missing file fix: created `delete-universal-flat-entity-from-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util.ts`
- Local login fix: had to manually insert workspaceMember records (seed partially failed)
- GraphQL codegen: `npx nx run twenty-front:graphql:generate --configuration=metadata`
- Cloudflare blocks API calls — work through code + deployment, not direct API
