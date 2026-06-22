# Tier 1 Canonical Field Mapping — Multica Ticket Fields

**Date**: 2026-06-17
**Scope**: How the twenty-multica-tickets Tier 1 gaps (dueDate, startDate, labels, metadata) map to the support-metadata-audit findings.

---

## Canonical Fields Added (Tier 1)

| Field | Type | Multica API Key | Purpose |
|---|---|---|---|
| `dueDate` | DATE_TIME | `due_date` | SLA target, calendar view, overdue detection |
| `startDate` | DATE_TIME | `start_date` | Ticket creation, response-time tracking |
| `labels` | TEXT (JSON array) | `labels: string[]` | Categorization: source, severity, product, status flags |
| `metadata` | TEXT (JSON object) | `metadata: Record<string,unknown>` | Structured KV: related entities, customer context, audit trail |

---

## Audit → Field Mapping

### Section 2 — Tier 1 Adoptable (CRM objects)

These live in `metadata` at ticket creation:

```json
{
  "relatedPerson": {"id": "...", "email": "...", "name": "..."},
  "relatedOrder": {"id": "...", "refund_amount_cents": 0, "fulfillment_status": "..."},
  "relatedAmbassador": {"id": "...", "status": "...", "rank": "..."},
  "relatedCommission": {"id": "...", "status": "...", "amount_cents": 0}
}
```

### Section 3 — Tier 2 Available (Supabase)

`metadata` captures relevant snapshots:

```json
{
  "fraud_review": {"type": "...", "status": "..."},
  "customer_expertise": {"total_interactions": 0, "last_interaction_at": "..."},
  "payment_events": [{"event_type": "dispute", "payload": {...}}]
}
```

### Section 4 — Gaps

| Gap | Field(s) Used |
|---|---|
| Ticket entity lifecycle | `status` (backlog→done), `startDate`, `dueDate` |
| Conversation thread | Twenty native `Note` / `Activity` — no new field needed |
| SLA / response time | `dueDate` (SLA target), `startDate` (first contact), `metadata.sla_policy` |
| Ticket categorization | `labels` (JSON array: source channel, severity, product area) |
| Knowledge base linkage | `metadata.kb_article` or `labels` `kb-linked` |
| Customer satisfaction | `metadata.csat_score` post-resolution |
| Automation rules | `metadata.escalation_policy`, `dueDate` auto-calc from priority |

### Section 5 — Recommended Fields

| Recommended Field | Canonical Location |
|---|---|
| `relatedOrder` | `metadata.relatedOrder` → future RELATION field |
| `relatedCommission` | `metadata.relatedCommission` → future RELATION field |
| `relatedFraudReview` | `metadata.fraud_review` → future RELATION field |
| `relatedAmbassador` | `metadata.relatedAmbassador` → future RELATION field |
| `source` | `labels` (primary), also `metadata.source` |
| `customerContext` | `metadata.customerContext` (computed snapshot at creation) |

---

## Labels Taxonomy

Standardized label values populated from audit findings:

| Category | Values |
|---|---|
| **Source channel** | `email`, `chat`, `phone`, `order_dispute`, `commission_dispute`, `ambassador_inquiry`, `fraud_review` |
| **Product area** | `supplement`, `course`, `service`, `affiliate-program`, `account` |
| **Severity** | `blocker`, `major`, `minor`, `cosmetic` |
| **Status flags** | `needs_triage`, `escalated`, `awaiting_customer`, `internal_note`, `kb-linked` |
| **Feature area** | `ticket-categorization`, `sla`, `field-relation`, `customer-context`, `source-channel` |

---

## Metadata Schema

```typescript
interface TicketMetadata {
  // Source attribution
  source: 'twenty-multica-tickets';
  app_version: string;
  created_via: 'api' | 'webhook' | 'manual';

  // Audit reference
  audit_section?: string;

  // Customer context (snapshot)
  customerContext?: {
    person_id: string;
    email: string;
    total_orders: number;
    lifetime_spend_cents: number;
    expertise_tags: string[];
    ambassador_status?: string;
    last_interaction_at?: string;
  };

  // Related entities (IDs for linking)
  relatedOrder?: { id: string; refund_amount_cents?: number; fulfillment_status?: string };
  relatedCommission?: { id: string; status?: string; amount_cents?: number };
  relatedAmbassador?: { id: string; status?: string; rank?: string };
  relatedFraudReview?: { id: string; type?: string; status?: string };

  // SLA tracking
  sla_policy?: {
    urgent: { first_response_h: number; resolution_h: number };
    high: { first_response_h: number; resolution_h: number };
    medium: { first_response_h: number; resolution_h: number };
    low: { first_response_h: number; resolution_h: number };
  };

  // Payment context
  payment_events?: Array<{ event_type: string }>;
}
```

---

## Created Issues

| Identifier | Title | Priority | Due | Section |
|---|---|---|---|---|
| X0-16 | Ticket categorization — type, severity, product tagging | high | 2026-07-01 | §4 Gaps |
| X0-11 | SLA / response time tracking — TTR and resolution metrics | high | 2026-07-01 | §4 Gaps |
| X0-12 | Add relatedOrder relation to xopure-ticket object | high | 2026-07-15 | §5 Fields |
| X0-13 | Add customerContext snapshot to ticket metadata on creation | medium | 2026-07-15 | §5 Fields |
| X0-14 | Ticket source field — channel attribution | medium | — | §5 Fields |
| X0-15 | Relations: relatedCommission, relatedFraudReview, relatedAmbassador | medium | — | §5 Fields |

Workspace: `d11337e4-0c4e-43b8-8fc8-8216c70f1427`
Project: `fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6`

---

## Known Limitations

- **labels and metadata persistence**: The Multica API (as of 2026-06-17) accepted `labels` and `metadata` in the issue create payload but returned them as empty (`[]` / `{}`) on subsequent GET. The description field carries the full payload — labels taxonomy and metadata schema are aspirational until the API persistence gap is resolved.

---

## Related Files
- `docs/support-metadata-audit-2026-06-17.md` — source audit
- `packages/twenty-apps/internal/twenty-multica-tickets/` — app source
