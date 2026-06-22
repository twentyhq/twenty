# Cookbook-Cook Adversarial Analysis: XO Pure CRM Ticketing

**Date**: 2026-06-17  |  **Revision**: 2 — corrected architecture after review
**Scope**: Adversarial gap audit of the twenty-multica-tickets build plan against SOTA CRM ticketing standards. References hosting-ticketing-audit, support-metadata-audit, and tier1-canonical-field-mapping documents.

---

## 0. Actual Architecture (Corrected)

The initial analysis mischaracterized the data flow. The real architecture is a dual-write pipeline:

```
xopure.com (customer submits issue)
    |
    +---> Multica (runtime: orchestration, routing, automation, SLA enforcement)
    |
    +---> Twenty CRM (system of record: ticket object linked to Person full dataset)
           |
           +---> Multica sync (status/updates flow back for coordination)
```

- **xopure.com** — inbound channel. Customers submit issues from the site.
- **Multica** — unified runtime. Coordinates, routes, enforces SLA, runs automation. NOT the primary data store.
- **Twenty CRM** — system of record. Houses each customer complete dataset. Ticket objects live here, linked to Person, Orders, Commissions, and all other CRM objects. Status updates flow back to Multica for orchestration.

This is a **Pattern A+** architecture — standard CRM-native ticketing augmented with a dedicated runtime layer for orchestration. This is actually more sophisticated than the typical Pattern A and closer to how Salesforce + Service Cloud orchestration works.

---

## 1. SOTA Standards - What CRM-Native Ticketing Looks Like in 2026

### Canonical Architecture

CRM-native ticketing in 2026 follows three architectural patterns, ranked by maturity:

**Pattern A: Ticket as CRM Object** (HubSpot, Salesforce, Twenty-native)
- Ticket IS a first-class CRM object with standard relations to Contact, Company, Deal, Order
- Conversation timeline lives as linked objects (Notes, Email threads, Chat transcripts)
- SLA engine is a separate scheduling layer with escalation policies
- **XO Pure is Pattern A+, with Multica as the orchestration/runtime layer**

**Pattern B: Unified Inbox** (Intercom, Zendesk, Crisp)
- All channels merge into a single inbox with routing rules
- Ticket is a view, not a data model - the conversation IS the record
- Works well for high-volume B2C but creates data silos from the CRM

**Pattern C: Linear-style Task Graph** (Linear, Height)
- Everything is an issue in a directed graph with dependencies
- No distinction between ticket, task, bug - just typed issues with relations
- Excellent for engineering teams, weak for customer-facing support

**Verdict: Pattern A+ is the strongest choice.** The anti-patterns to avoid: (1) Pattern B conversation-as-record makes CRM reporting impossible, (2) letting Multica become the system of record — CRM must own the customer dataset.

### SOTA Feature Checklist for Pattern A+

| Capability | SOTA Expectation | Plan Status |
|---|---|---|
| Omnichannel aggregation | Email, chat, phone, social to single ticket | IN PLACE - xopure.com is the inbound channel |
| Auto-routing and triage | Rules engine + AI classification on create | PARTIAL - AI triage agent exists; Multica can route but needs label read-back for conditional logic |
| SLA engine | Per-priority, per-customer-tier, business hours aware | NOT ADDRESSED - Multica runtime could enforce this but no SLA config exists |
| Macros / canned responses | Templated replies with variable substitution | NOT ADDRESSED |
| Collision detection | Agent X is already viewing/replying | NOT ADDRESSED |
| Customer portal | Self-service ticket view + KB on marketing site | PARTIAL - xopure.com exists but no ticket-status view or KB surfaced |
| CSAT / NPS | Post-resolution survey with reporting | IDENTIFIED AS GAP - no design |
| Merge / link / duplicate detection | ML-based duplicate finding | NOT ADDRESSED |
| Parent/child ticket hierarchy | Sub-tickets, linked issues | NOT ADDRESSED - no hierarchy in object model |
| Webhook / automation triggers | On ticket created, fire webhook | PARTIAL - Multica runtime can orchestrate; Twenty has workflows |
| Audit log | Immutable timeline of every field change | IN PLACE - Twenty Activity provides this natively on CRM side |
| Reporting dashboard | Time-to-resolution, volume by category, agent performance | NOT ADDRESSED |

---

## 2. Adversarial Gap Audit - What Will Break First

### CRITICAL - Will Break in Week 1

**Gap 1: Dual-write consistency — Multica and CRM can desync**

The architecture writes to both Multica and the CRM on ticket creation. If either write fails, the two systems disagree. Scenarios:

- Multica write succeeds, CRM write fails: ticket exists in runtime but not on customer record. Agent sees nothing in CRM. Customer gets no response.
- CRM write succeeds, Multica write fails: ticket exists on customer record but runtime cannot orchestrate. No SLA tracking. No automation. Ticket rots silently.
- Partial update (e.g., status change): CRM updates to resolved, Multica sync fails. Runtime keeps escalating an already-resolved ticket.

**Fix**: Implement an outbox pattern. The CRM is the source of truth for ticket state. Multica polls or receives webhooks from CRM, not the other way around. On ticket creation: write to CRM first, CRM fires webhook to Multica. On status change: CRM is authoritative, Multica syncs. Single writer, single source of truth, eventual consistency on the runtime side.

**Gap 2: Multica label read-back breaks orchestration**

The tier1-canonical-field-mapping.md reveals: Multica API accepted `labels` and `metadata` on create but returned them as empty (`[]` / `{}`) on subsequent GET. Since Multica is the runtime layer, this is not a data-loss issue (CRM is the store) — but it IS an orchestration issue:

- Multica cannot route based on labels (e.g., `ticket-type: order_issue` -> assign to fulfillment team)
- Multica cannot enforce SLA by priority (e.g., `priority: urgent` -> 1hr response window)
- Multica cannot filter/query by labels for automation triggers
- Every orchestration decision that depends on structured ticket metadata requires a label read, and every read returns empty

**Fix**: Either fix the Multica API label persistence bug (root cause), or store labels in the CRM ticket object and have Multica poll the CRM for label data rather than reading its own API. The CRM has the authoritative labels; Multica should consume them from there.

**Gap 3: No ticket lifecycle ties to order state**

A ticket about a refund on order #1234 has no automated link to the order `refund_amount_cents` or `payment_status`. If the refund processes, the ticket stays open. If the ticket is marked resolved but the refund never actually processed, nobody knows.

- **Worst case**: Agent marks resolved but Stripe refund failed silently. Customer never gets money back. Chargeback 60 days later.
- **Exploit vector**: Ambassador files commission dispute, agent resolves it with a note will pay next cycle, ticket closes, commission never paid. Ambassador has no recourse because ticket is resolved.

**Fix**: Webhook on `orders.refund_amount_cents` change to auto-update linked ticket status in CRM. Ticket resolution should verify underlying data changed before allowing status = resolved (refund > 0, commission status = paid, etc.). CRM enforces this constraint; Multica receives the verified status update.

**Gap 4: No SLA means no escalation — tickets will rot in the CRM**

Without SLAs, a `priority: urgent` ticket sits unanswered for 3 days. Since Multica cannot read labels (Gap 2), it cannot enforce time-based escalation. The CRM has no built-in escalation engine. Result: nothing escalates anything.

- **Exploit**: Malicious affiliate creates tickets strategically to waste support time, knowing there is no cost and no metric tracking the damage.

**Fix**: Implement SLA as a cron job against the CRM (not Multica, since label read-back is broken). Query CRM tickets where `status NOT IN (resolved, closed)` and `created_at < now() - threshold`. Escalate by reassigning or posting an automated Note. Minimum: `urgent` = 1hr, `high` = 4hr, `medium` = 24hr, `low` = 72hr. Approximately 50 lines of code against the Twenty API.

### HIGH - Will Break in Month 1

**Gap 5: The `relatedPerson` field is the only bridge — insufficient for multi-entity customers**

A ticket links to a Person. But a customer could have 50 orders, be an ambassador, have 3 fraud reviews, and 200 commission lines. Without `relatedOrder`/`relatedCommission`/`relatedAmbassador` relations, the agent manually searches through everything to find what the ticket is actually about. This is a support velocity killer.

**Fix**: Ship `relatedOrder`, `relatedCommission`, `relatedAmbassador` relations in v1. These are not optional for any ticket beyond account-access or general-inquiry types.

**Gap 6: No customer identity verification on inbound submission**

Issues originate from xopure.com. If the submission form doesn not verify customer identity, an ambassador could submit a ticket claiming to be a VIP customer for priority treatment. An agent could link a ticket to the wrong Person and expose another customer order data.

**Fix**: The xopure.com submission form should require email verification (magic link or code) before the ticket is created. If the email matches an existing Person, link automatically. If not, create an unverified Person record that gets merged on identity confirmation.

**Gap 7: No customer-facing notification loop**

When a ticket is created, updated, or resolved — the customer finds out only if they check the site. There is no email notification, no status page, no push. Agent responds but customer never knows.

**Fix**: Wire ticket status changes to email notifications via Supabase Edge Function. Minimum: created (acknowledgement with ticket #), updated (agent replied), resolved (with CSAT survey link). Multica can trigger these once it can read labels (Gap 2).

### MEDIUM - Will Cause Pain in Month 2-3

**Gap 8: Labels taxonomy is aspirational but not enforced**

The labels taxonomy has 6 categories with 30+ values. Nothing prevents an agent from typing a typo or using an undefined label. Since Multica orchestration depends on labels (Gap 2), and CRM reports depend on them, unenforced labels break everything downstream.

**Fix**: Enforce labels as dropdowns/constrained fields in the Twenty object definition and on the xopure.com submission form. No free text.

**Gap 9: No GDPR / data retention story**

Tickets contain PII (email, name, order history). With EU customers in production:
- Data export on request (SAR)
- Data deletion on request (right to erasure)
- Retention policy (how long are resolved tickets kept?)
- Audit trail of who accessed what ticket

Twenty provides audit trail (Activity). The rest is not addressed. Since data lives in both CRM and Multica, deletion must propagate to both systems.

**Gap 10: The AI triage agent has no feedback loop**

The `ticket-triage-agent.ts` classifies tickets for routing through Multica. When it is wrong, there is no correction signal, no retraining, no confidence threshold routing to human. Accuracy degrades silently as patterns shift.

**Fix**: Add `ai_triage_confidence` (0-1) and `ai_triage_overridden` boolean to the CRM ticket object. If confidence < 0.7, route to human in Multica (requires Gap 2 fix for label read-back). Track override rate. If > 20%, retrain or disable.

---

## 3. Prioritized Action Items — What Must Change Before Shipping

Ranked by blast radius (damage if wrong x probability of being wrong):

| # | Action | Blast Radius | Effort |
|---|---|---|---|
| 1 | **Fix dual-write consistency** — CRM as single source of truth with outbox/webhook to Multica. Prevent desync between customer record and runtime. | Critical — data integrity | Medium |
| 2 | **Fix Multica label read-back** — orchestration (routing, SLA, automation) depends on reading labels from the runtime. Without this, Multica is a dumb pipe. Alternatively, have Multica consume labels from CRM. | Critical — orchestration blocked | Medium |
| 3 | **Add `relatedOrder`, `relatedCommission`, `relatedAmbassador` relations** to the ticket object. Support velocity depends on context links. | High — agent efficiency | Low |
| 4 | **Implement minimum viable SLA** — cron against CRM (not Multica, until Gap 2 is fixed). Time-to-first-response per priority with escalation. | High — trust and reliability | Low |
| 5 | **Auto-verify ticket resolution** — on status change to resolved, check linked objects reflect actual resolution. Block or flag if not. | High — prevents hollow resolutions | Medium |
| 6 | **Wire customer email notifications** — acknowledgement on create, update on reply, CSAT on resolve. Minimum viable loop. | High — customer experience | Medium |
| 7 | **Enforce labels taxonomy as constrained fields** — no free text. Breaks everything downstream if unenforced. | Medium — data quality | Low |
| 8 | **Add customer identity verification on xopure.com form** — email verification before ticket creation and Person linking. | Medium — security | Medium |
| 9 | **Add AI triage confidence + override tracking** — prevent silent degradation of automated routing. | Medium — AI reliability | Low |
| 10 | **Design GDPR retention/deletion flow** — document policy before EU customer data enters. Must cover both CRM and Multica. | Low (until it is not) | Low |

---

## 4. Summary Verdict

The plan has the **right architecture** (Pattern A+: CRM as system of record + Multica as runtime). The metadata audit correctly identifies existing assets. The dual-write design is sophisticated but introduces the primary risk surface.

**The three things that will kill this in production:**

1. **Dual-write desync** — CRM and Multica will diverge on day 1 without an outbox pattern. One must be the single writer. CRM owns the customer dataset; make it authoritative.
2. **Multica label read-back broken** — the runtime cannot orchestrate what it cannot read. Every automation, route, and SLA rule that inspects labels is dead code until this is fixed.
3. **No resolution verification** — resolved will become hollow. Tickets will close while refunds fail silently and commissions go unpaid. Trust in the system erodes within the first month.

Fix these three, ship the relations and SLA, then iterate. The remaining gaps (collision detection, macros, KB, CSAT) are standard post-launch improvements.

---

## Related Documents

- [[hosting-ticketing-audit-2026-06-17]] — hosting topology and ticketing presence audit
- [[support-metadata-audit-2026-06-17]] — inventory of adoptable support metadata
- [[tier1-canonical-field-mapping]] — Multica field mapping and labels taxonomy
