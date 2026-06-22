# XO Pure Hosting & Ticketing Audit

**Date**: 2026-06-17  
**Scope**: Production hosting topology, Railway service inventory, and support/ticketing mechanism audit across xopure.com and crm.xopure.com.

---

## 1. Hosting Topology

Everything runs on **Railway** under the `Blockcities's Projects` workspace, split across two projects.

### 1.1 `xo101_peptides` — Main Site + Ecommerce Backend

Railway project ID: `25aa618c-2b13-43da-9b76-b981eb7de4e2`

| Service | Role |
|---|---|
| **`Site`** | **`xopure.com`** — main marketing site. Vite/React SPA. |
| `server` | Custom backend server |
| `x02_peptides` | Peptide product sub-site |
| `platform` | Platform service |
| `worker` / `worker_native` | Background job workers |
| `proxy` | Reverse proxy |
| **Supabase stack** | Auth, Postgres, Realtime, Storage, Studio, Kong, PostgREST, PgBouncer, Edge Functions, MinIO, imgproxy, lsp |

This project hosts the **live ecommerce database** (affiliates, orders, commissions, products, customers).

### 1.2 `crm_xopure` — Twenty CRM

Railway project ID: `60cfe5c5-1926-4306-aa48-1c56c503b96b`

| Service | Version | Domain |
|---|---|---|
| **`crm-v2`** | `twentycrm/twenty:v2.8.3` | **`crm.xopure.com`** ← live production |
| `Xopure_crm` | `twentycrm/twenty:v0.32.0` | (no domain — superseded v1) |
| `michael_crm` | repo `dev` branch | `michaelcrm-production.up.railway.app:8080` |
| `worker-v2` | `twentycrm/twenty:v2.8.3` | background jobs |
| `Worker` | `twentycrm/twenty:v0.32.0` | (old worker) |
| `Backup` | cron | R2 hourly encrypted backups |
| `Postgres` | managed (`postgres-ssl:18`) | Twenty internal DB |
| `Postgres-IqbU` | managed | Secondary Postgres |
| `Redis` | managed `redis:8.2.1` | BullMQ job queues |

**Source repo**: `MyBlockcities/Xopure_crm` (this repo).  
**Deployment**: `crm-v2` runs from Docker image `twentycrm/twenty:v2.8.3`. `michael_crm` is the only service that builds from repo source (`services/server/Dockerfile` on `dev` branch). Auto-deploy is OFF for all services.

### 1.3 Deployment Pipeline

```
local dev --> twenty pod stack --> (manual verify) --> michael_crm --> (manual gate) --> crm-v2 (prod)
```

Agent can deploy to `michael_crm` only. Production requires explicit human approval.

---

## 2. Ticketing / Support Audit

### 2.1 Result: **No ticketing or support system exists in production.**

### 2.2 `xopure.com` (Marketing Site)

- Single-page Vite/React app. All paths (`/contact`, `/support`, `/help`, `/tickets`, `/faq`) return the same HTML shell with client-side routing.
- No contact form backed by persistent storage.
- No support portal, knowledge base, or ticket submission UI.
- Only user tracking: Google Analytics (GA4 `G-NYBP3166SQ`) + Meta Pixel (`923544627368308`).

### 2.3 `crm.xopure.com` (Twenty CRM v2.8.3)

- Standard Twenty CRM features: contacts, companies, opportunities, tasks, notes, workflows.
- No custom ticketing/support modules installed on the live instance.
- The `xopure-crm` internal app handles CRM-Supabase sync mapping — not support.

### 2.4 Supabase (Ecommerce Database)

Production schema inventory — **zero support/ticketing tables**:

| Table | Purpose |
|---|---|
| `affiliates` | Ambassador/affiliate records |
| `orders` / `order_items` | Ecommerce orders |
| `products` | Product catalog |
| `commission_ledger` | Commission calculations |
| `commission_config_versions` | MLM compensation plan configs |
| `commission_periods` / `period_snapshots` | Period close & genealogy snapshots |
| `rank_definitions` | Rank qualification criteria |
| `affiliate_payouts` / `affiliate_attributions` | Payout & attribution tracking |
| `affiliate_clicks` / `affiliate_click_events` | Click tracking |
| `discount_codes` | Promo codes |
| `fraud_reviews` | Commission fraud detection (NOT customer support) |
| `customer_expertise` | Customer analytics & drip state |
| `quiz_results` | Product recommendation quizzes |
| `server_carts` | Shopping cart persistence |
| `payment_events` | Payment gateway webhooks |
| `sync_logs` | Google Sheets sync logs |
| `store_settings` | KV store settings |
| `user_roles` | RBAC |
| `retail_prospects` / `influencer_prospects` | Sales prospecting pipeline |
| `crm_sync_map` | Supabase<->CRM ID mapping |
| `crm_sync_events` | Sync event queue |
| `twenty_sync_audit` | CRM sync audit trail (in `crm` schema) |
| `twenty_activity_log` | CRM write-back tracking (in `crm` schema) |

`fraud_reviews` is for commission integrity, not customer support. No `tickets`, `support_requests`, `help_desk`, or `customer_support` table exists.

---

## 3. In Development: `twenty-multica-tickets`

Located at `packages/twenty-apps/internal/twenty-multica-tickets/` in this repo. **Not deployed to any Railway service.**

| File | Purpose |
|---|---|
| `src/objects/xopure-ticket.object.ts` | Ticket object: title, description, status, priority, assignee, related person |
| `src/views/ticket-kanban.view.ts` | Kanban board view |
| `src/views/ticket-table.view.ts` | Table list view |
| `src/components/create-ticket-form.front-component.tsx` | Create ticket form UI |
| `src/command-menu-items/create-ticket.command-menu-item.ts` | Quick-create from command palette |
| `src/navigation-menu-items/tickets.navigation-menu-item.ts` | Sidebar navigation entry |
| `src/fields/ticket-related-person.field.ts` | Relation field to person object |
| `src/agents/ticket-triage-agent.ts` | AI agent for ticket triage |
| `src/skills/ticket-triage.skill.ts` | Agent skill definition |
| `src/constants/universal-identifiers.ts` | Stable UUIDs for ticket object & fields |

This is a Twenty SDK app. Once deployed to `crm-v2`, it adds a native ticketing system inside the CRM at `crm.xopure.com`.

---

## 4. Summary

| Question | Answer |
|---|---|
| Where is `xopure.com` hosted? | Railway `xo101_peptides`, service `Site` |
| Where is `crm.xopure.com` hosted? | Railway `crm_xopure`, service `crm-v2` |
| Is there a support ticketing system on xopure.com? | **No** — marketing-only SPA |
| Is there a support ticketing system in the CRM? | **No** — vanilla Twenty v2.8.3 |
| Is there ticketing in the Supabase DB? | **No** — ecommerce/affiliate schema only |
| What ticketing is being built? | `twenty-multica-tickets` Twenty app (in repo, not deployed) |
