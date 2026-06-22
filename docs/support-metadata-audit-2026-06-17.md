# XO Pure Support Metadata Audit

**Date**: 2026-06-17
**Scope**: Inventory of all support-adjacent metadata already being recorded across Supabase and the live Twenty CRM at crm.xopure.com. Identifies what a ticketing system can adopt vs. what gaps remain unfilled.

---

## 1. How This Connects to the Ticketing Build

The `twenty-multica-tickets` app (in repo, not deployed) defines a ticket object with `relatedPerson` as its primary bridge to existing data. This audit identifies what other data is already live and linkable so the ticket object can adopt existing metadata rather than duplicating it.

---

## 2. Tier 1 - Directly Adoptable (already in CRM as objects)

These are live Twenty CRM objects the ticket system can link to via relations:

| CRM Object | Source Table | Support-Relevant Fields |
|---|---|---|
| **Person** | `auth.users` / `profiles` | `email`, `name`, `phone`, enrichment tags |
| **Order** | `public.orders` | `refund_amount_cents`, `fulfillment_status`, `manual_review_required`, `tracking_number`, `tracking_url`, `shipped_at`, `delivered_at`, `payment_status`, `commerce_order_id` |
| **Ambassador** | `public.affiliates` | `status`, `reason`, `rank`, held/payable/paid/lifetime commission fields |
| **Commission** | `public.commission_ledger` | `status`, `explanation`, `pay_area`, `amount_cents`, `calculation_trace_json` |
| **Payment** | `public.payment_events` | `gateway_event_id`, `event_type`, full gateway `payload` (JSONB - includes Stripe dispute data) |
| **Note** (Twenty standard) | Twenty native | Free-text notes on any record - already usable as support conversation log |
| **Task** (Twenty standard) | Twenty native | Action items, assignable - already usable as support action items |
| **Activity** (Twenty standard) | Twenty native | Full audit timeline of all CRM changes per record |

---

## 3. Tier 2 - Available via Relation (in Supabase, synced or syncable)

| Supabase Table | Support-Relevant Fields | How to Use |
|---|---|---|
| `fraud_reviews` | `review_type`, `evidence` (JSONB), `status`, `notes`, `reviewed_by`, `reviewed_at` | Link ticket to fraud case for dispute investigation |
| `customer_expertise` | `expertise_data` (JSONB), `drip_state` (JSONB), `total_interactions`, `last_interaction_at` | Customer context for support - interaction history, product preferences |
| `quiz_results` | `answers` (JSONB), `recommended_products` | What the customer was recommended vs what they bought |
| `payment_events` | `event_type`, raw `payload` (JSONB) | Stripe chargeback/dispute events live in payload |
| `affiliate_click_events` | `page_url`, `referrer`, `is_suspicious` | Attribution disputes |
| `order_items` | `sku`, `name`, `unit_price_cents`, `quantity` | What exactly was ordered - refund/return context |
| `crm.twenty_activity_log` | `activity_type` (note/task_status/stage_update/owner_assignment), `payload` (JSONB) | CRM changes written back to Supabase - bi-directional sync paper trail |
| `crm.twenty_sync_audit` | `operation`, `status`, `error_message`, `duration_ms` | Sync health for data visibility troubleshooting |
| `crm_sync_events` | `status`, `error_message`, `attempts` | Sync queue health per record |
| `server_carts` | `items` (JSONB), `affiliate_code`, `status` | Abandoned carts - proactive support opportunity |
| `discount_codes` | `code`, `type`, `value`, `max_uses`, `current_uses`, `active` | Code validity for discount troubleshooting |
| `sync_logs` | `source`, `rows_synced`, `status`, `error_message` | Sheet sync errors - potential data gaps |

---

## 4. What is NOT Recorded - Gaps the Ticketing System Fills

| Gap | Why It Matters |
|---|---|
| **Ticket entity** - no support request with status/priority/assignee lifecycle | Cannot track, escalate, or measure support volume |
| **Conversation thread** - no message/timeline between customer and support | No history, context resets on every contact |
| **SLA / response time** - no time-to-first-response, resolution time | Cannot measure or enforce support quality |
| **Ticket categorization** - no type/severity/product tagging | Cannot triage, route, or report on support themes |
| **Knowledge base linkage** - no help article to ticket connection | Repeated questions waste time; no deflection metric |
| **Customer satisfaction** - no CSAT/NPS on resolution | Cannot measure support effectiveness |
| **Automation rules** - no conditional escalation logic | Manual triage on every ticket |

---

## 5. Recommended Adoption: Fields the Ticket Object Should Gain

The `xopure-ticket` object already has `relatedPerson`. Adding these relations would connect it to the existing data fabric:

| New Field | Relation Target | Use Case |
|---|---|---|
| `relatedOrder` | `xopure-order` | Refund, fulfillment, tracking issues |
| `relatedCommission` | `xopure-commission` | Payout disputes, hold questions |
| `relatedFraudReview` | `fraud_reviews` (via sync) | Investigation tickets |
| `relatedAmbassador` | `xopure-ambassador` | Ambassador support (rank, commissions, account) |
| `source` | (enum field) | `email`, `chat`, `phone`, `order_dispute`, `commission_dispute`, `ambassador_inquiry` |
| `customerContext` | (computed virtual) | Pulls `customer_expertise`, last order date, lifetime spend - read-only snapshot at ticket creation |

Existing `Note` and `Task` Twenty objects can serve as the conversation timeline and action items within a ticket - no need to build those from scratch.

---

## 6. Current Custom Objects in Live CRM

For reference, the `xopure-crm` Twenty app (deployed on `crm-v2`) syncs these custom objects from Supabase:

| CRM Object | Supabase Source |
|---|---|
| Ambassador | `public.affiliates` |
| Customer | `public.profiles` / `auth.users` |
| Order | `public.orders` |
| Order Line | `public.order_items` |
| Product | `public.products` |
| Commission | `public.commission_ledger` |
| Payment | `public.payment_events` |
| Payout Batch | `public.affiliate_payouts` (batched) |
| Referral Relationship | `public.affiliates` (parent_id chain) |
| Automation Trigger | `public.crm_sync_events` + logic functions |
| Sync Map | `public.crm_sync_map` |
| Sync Cursor | internal bookkeeping |
| Retail Prospect | `public.retail_prospects` |
