# Data Model

Read this when creating or modifying a Twenty CRM object or field.

## Standard Twenty objects in use

- **People** — represents both leads and clients. There is no separate "Lead" object; a person's status is what distinguishes them (see below), not which table they sit in.
- **Companies** — used where a lead/client is a business, not an individual.
- **Opportunities** (Twenty's deal/pipeline object) — this is where lead-vs-client status actually lives. A person is treated as a lead while their Opportunity is open, and as a client once a human marks that Opportunity Closed/Won in Twenty's own UI. Every agent's identity-resolution logic checks this field — see `02-architecture.md` and `03-agents/whatsapp-agent.md`.
- **Tasks** — used for the Manager agent's employee task assignments.
- **Notes** — available for conversation context/history where needed.

## Custom fields on Opportunities

- **Source campaign / source ad** — text field, populated by the WhatsApp agent when a new lead's first message carries Meta CTWA referral metadata (see `03-agents/whatsapp-agent.md`). First-touch: set once, not overwritten by a later ad click. This is the field the Reporting agent groups by for lead-source breakdowns.
- **Source click ID** (optional, not yet required) — could hold the raw `ctwa_clid` from the referral object, kept for a possible future Meta Conversions API integration (reporting conversions back to Meta for ad optimization). Not part of any current requirement — add only if that feature gets picked up later.

## Custom object: Invoice

Not a native Twenty object — built via Twenty's Apps framework as a custom object. Full field list:

- Client (relation to the Company/Person record)
- Amount
- Due date
- Status (e.g., unpaid / paid / overdue) — this is what Twenty's native workflow engine watches to trigger reminders (see `05-features.md`)
- GSTIN — both the agency's and the client's
- HSN/SAC code
- Taxable value
- Tax split — CGST + SGST (intra-state) or IGST (inter-state), whichever applies
- Sequential invoice number — GST requires invoices to be numbered sequentially, not arbitrarily
- Place of supply

## Roles

- **Admin** (the founder) — full access. Can create staff accounts, assign tasks, and is the only role that can reach the Manager, WhatsApp, and Reporting agents.
- **Member** (staff) — standard CRM access to the objects above. Can reach the Assistant agent only, for CRM navigation help — see `03-agents/assistant-agent.md`.

This split is enforced at the app layer (Controlled Tool API + widget routing), not through Twenty's own granular row-level permissions — see `01-tech-stack.md` for why.