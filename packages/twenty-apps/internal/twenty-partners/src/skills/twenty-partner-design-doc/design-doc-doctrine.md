# Design-doc doctrine — translating a lead into Twenty terms

**Portable doctrine.** This file is tool-agnostic: it defines *what* a Twenty partner design doc is, its structure, the rules, and how to verify it. It is consumed two ways — by the Claude Code skill `twenty-partner-design-doc` (see `SKILL.md` in this folder), and, in a later phase, as the `content` of a Twenty `defineSkill` driving an in-product agent. Keep it free of any one tool's mechanics (no file paths, no tool names).

## Purpose

Produce a **design doc** that translates a qualified lead's needs into **Twenty terms** — data model, views, automations, integrations, permissions, reporting, hosting — so an implementation **partner can scope and quote** the work.

**Core principle:** identify *all* the work with **no blindspots**, **ground every claim** in the source or in live Twenty docs, and **present options rather than prescribe**. The partner quotes off this doc, so a confident-but-wrong capability claim or a hidden requirement is the worst failure.

**Stay focused on the client's outcome.** Every line must change what the partner *builds* or what the client *receives*. The doc is design-focused, not a meeting record: a requirement's backstory — *why* the vendor or a third party does or doesn't satisfy it — is not a build input. Capture the **consequence**, cut the backstory.

The doc is **partner-facing** and may be forwarded verbatim. It is a *suggestion to make scoping easier* — not a spec that constrains how the partner builds.

## Output structure (fixed)

Header: lead · date · author = Twenty (partnerships) · status. Then a **"What this is"** callout framing it as a partner-scoping suggestion, full-surface, *not* an MVP. **Keep the header to those fields** — do not list source materials, internal timelines, or who-promised-what; they are not load-bearing and not customer-safe (the doc is forwarded verbatim).

Flag legend: 🟥 heavy / product-constrained · ❓ open question to resolve before quoting · `(inf.)` modelling inference.

1. **Context** — the 30-second read: who they are, what they want, deployment requirement, scale, language/region.
2. **Domain-language map** — the customer's terms that collide with Twenty's (e.g. their "partner" = a donor). Prevents misreads downstream.
3. **Data model in Twenty terms** — the core. Present objects as a **table, one row per object**: `Object | Std/Custom | Represents | Key fields (traceable, (inf.)-tagged) | Core relations`. Spell out SELECT option sets. **Model the relationships, not just the fields** — who introduced/sourced a record (e.g. an ambassador→Opportunity `sourcedBy` link), parent/child, ownership; these carry as much scoping signal as the attributes. State product constraints inline (no formula fields; custom objects auto-get attachments/notes/tasks/timeline).
4. **Views & navigation** — pipelines/kanban, tables, per-record page layouts.
5. **Automations** — only the automations the customer named; present Workflow-or-logic-function for each.
6. **Integrations** *(conditional — include only when the customer explicitly names an external system to connect)* — external systems → Twenty: direction, *indicative* mechanism (not prescriptive), data flow, risks/unknowns. **If no integration is named, omit this section entirely and renumber the rest** — never infer integrations as a default. Stay alert to spot a likely one and, at most, raise it as a single ❓ in §11 rather than a whole section.
7. **Roles, permissions & RLS** — map named roles to Twenty's object / field / row-level model; answer "do we need RLS?" against verified, plan-gated capability.
8. **Reporting & analytics** — map reporting asks to native Dashboards; flag gaps (ratios needing rollups; export/sharing limits) each with a solution.
9. **Hosting & compliance** — cloud vs self-host, data-residency requirement (verify), GDPR. Flag contradictions.
10. **Suggested phasing** — "(the partner's call, not Twenty's)" — layers, labelled a suggestion.
11. **Open questions / blindspot-killers** — the list a partner must resolve before pricing.
12. **References & verification** — a table mapping each load-bearing claim to its source doc, plus an explicit list of what the docs could NOT confirm (the ❓s).

Scale each section to its content. **Coverage of surface area matters more than depth per item.**

## Rules (and why each matters)

- **Ground everything; tag inferences `(inf.)`; never grow scope.** The partner quotes off this — an invented field or requirement inflates the quote or sets a false expectation. If the *concept* is from the source but the *field name* is yours, that is an inference — tag it. Values lifted from the source (e.g. the customer's own category list → SELECT options) are *grounded*; only names/fields you coin are inferences.
- **Record the design consequence, not the backstory.** State a requirement and the **client's path** that follows from it; do not litigate *why* it's true. When a requirement traces to vendor-internal or third-party detail — corporate structure, legal domicile, ownership, internal commercial arrangements, who-confirms-what-with-whom — keep only the consequence; that detail is a commercial matter, not a build input, however much airtime it got on the call. (E.g. *"client needs a European vendor"* → *"partner-hosted EU self-host is the path; managed cloud only under a European-contracting arrangement"* — **not** a write-up of the vendor's statutes / HQ / ownership / CEO sign-off.) An open item the client is waiting on is recorded as the **decision it gates** (a ❓ in §11), not as a narrative of the vendor's situation.
- **Database discipline: reuse and extend standard objects; add a custom object only at a genuine wall.** Company / Person / Opportunity + the built-in Notes / Tasks / Timeline cover most CRM needs; every new object multiplies build and maintenance. A **human actor is a Person with a role flag before it is a new object** — create an object only when it needs its own pipeline or reporting. Name the wall when you add one.
- **When the brief is thin, under-reach the inferred model — don't fill the gap.** A blurry situation (no discovery call, sparse notes) is a reason to model the *fewest, most certain* objects and leave the rest as ❓ open questions — not to compensate with an elaborate inferred domain. An over-detailed inference reads as scope and cost the customer never asked for and can scare a hesitant buyer off. Lead with standard objects plus the one or two custom objects the domain unmistakably needs; everything else is a question to confirm, not a row in the table. Say plainly, up front, that the model is a minimal starting sketch to validate.
- **Present build approaches; don't prescribe.** An automation can be a no-code Workflow *or* a logic function in an app — say both. Prescribing one penalizes a partner who would do the other. The doc identifies the *need*, not the *build*.
- **Every problem carries a path — never a dead-end flag.** If you flag a constraint (e.g. dashboards can't share externally), pair it with at least one solution (CSV export, a front-component, a public site on the API) or a question that resolves it. A flag with no path is useless to someone pricing the work.
- **Flag what an approach can't satisfy.** The doc's value is surfacing walls and limits per requirement so the partner prices around them — not picking the one true solution.
- **Partner-facing voice.** Say **"Twenty," never first person** ("we / our / ours"). **No local file paths** in the output — cite shareable `docs.twenty.com` URLs only. (Customer quotes that contain "we/our" are fine — they are quotes.)
- **No characterisations or asides — only requirements and capabilities.** The doc is customer-forwardable, so keep out the source chat's off-hand remarks: characterisations of the buyer (budget, temperament, sophistication), named comparisons to competing vendors, and internal partnerships notes (deadlines, who promised what). If price-sensitivity or a competitor displacement genuinely shapes the build, state it neutrally as a requirement (e.g. cost is a selection criterion) — never as a quote or judgement.
- **Verify before asserting capability.** Any "Twenty can / can't / has / lacks X" that moves the quote must be verified live (see Verification). **Undocumented ≠ impossible.**

## Formatting

- One line per paragraph — **no mid-sentence hard wraps** (they render as broken lines).
- **Never a bare `~`** for "approximately" — GitHub markdown pairs `~...~` into strikethrough. Write "around" / "about".
- Mark unverified capability claims ❓, never as fact.

## Verification

Any statement of the form **"Twenty can / can't / has / lacks X"** that changes the partner's quote MUST be verified **live** before it is stated as fact. Model training is stale on a fast-moving product; the worst failure is a confident, authoritative-sounding claim that is wrong.

**Source hierarchy (what to trust, in order):**
1. **Live docs** (`docs.twenty.com`) — primary truth. For the highest-stakes claims, read the page's primary text rather than trust a summary.
2. **Established Twenty SDK build patterns** (hands-on) — build-level facts the customer docs omit (no formula fields; custom objects auto-get attachments/notes/tasks/timeline; two-file relations).
3. **The Twenty operator** (a Twenty team member) — best for "is it shipped / internal / undocumented."
4. **Model training** — never the sole basis for a high-stakes claim.

**Right doc layer (the trap):** capabilities live in two layers — check the right one.
- **Product capabilities** (what the CRM does for the *customer*): the **user guide + pricing page**. Covers roles / row-level permissions, dashboards, plans, hosting, data residency.
- **App capabilities** (what an *app* can define): the **developer/extend** docs. Covers field types, fields, logic functions, views, page layouts.
Checking only the app layer is how "row-level not supported" (wrong) happens — row-level is a **product feature on the Organization plan**. The converse also holds: SDK build patterns *are* sufficient to assert **build-layer** facts even when the customer docs are silent (e.g. auto system relations) — do not demote a well-established build fact to ❓.

**Always verify (the load-bearing checklist), live, every run:**
1. Field types & constraints (e.g. no formula/computed fields).
2. Standard-object extension & relabeling (add fields ✓; relabel / edit built-in SELECT options?).
3. Roles & permissions — object / field / row-level, and plan-gating (which tier).
4. Dashboards & reporting — chart/widget types, beta status, export / external-sharing limits.
5. Automation surfaces — Workflows vs logic functions, what each can do.
6. Integration mechanisms — webhooks, HTTP triggers, scheduled functions, connections.
7. Hosting & deployment — cloud plans & regions / **EU data residency**, self-host availability & requirements.
Plus: any other capability claim the draft makes that carries a 🟥 or ❓ flag.

**Fallback chain:**
- Docs confirm → state it as fact; record the source in §12.
- Docs silent or ambiguous → ask the operator (if available).
- Operator unavailable or unsure → render it as a ❓ open question. **Never assert.** When you fetched a page and it was simply *silent*, record that as "docs silent (URL)" rather than leaving the claim unsourced.

**§12 appendix format:** a `Claim (§) | Verified against` table, then an explicit "**Could not be confirmed in public docs (❓ — check with Twenty directly):**" list. Unverified items stay ❓ in the body too — never silently promoted to fact. Cite the **human-readable (non-`.md`) URL** here — the `.md` twin is for *your* fetch, not for the partner (a `.md` link renders as raw markdown in a browser).

**Where to verify (Twenty doc map):** docs base = `https://docs.twenty.com/` — fetch **`<path>.md`** for the clean markdown twin (the form to prefer). Paths:
- Product / user-guide: `user-guide/dashboards/overview` · `user-guide/dashboards/capabilities/widgets` · `user-guide/permissions-access/how-tos/permissions-faq` · `user-guide/data-model/overview` · `user-guide/data-model/capabilities/fields` · `user-guide/data-migration/how-tos/export-your-data`
- Developer / extend: `developers/extend/apps/data/objects` · `developers/extend/apps/data/extending-objects` · `developers/extend/apps/data/relations` · `developers/extend/apps/logic/logic-functions` · `developers/extend/apps/logic/connections` · `developers/extend/apps/layout/views` · `developers/extend/apps/layout/page-layouts` · `developers/extend/apps/config/roles`
- Self-host: `developers/self-host/self-host`
- Pricing & plans: `https://twenty.com/pricing` — **marketing page, no `.md`**; fetch as HTML.
If a `.md` 404s, drop the suffix or re-derive from the docs index — the map can go stale.

## Common mistakes

| Mistake | Reality / fix |
|---|---|
| "Twenty isn't a BI tool" / "can't do row-level" | Stale training. Twenty has Dashboards; row-level is on the Organization plan. **Verify live.** |
| Checked only the app-SDK doc for a product capability | Row-level lives in the product/pricing layer. **Verify the right layer.** |
| Added fields not in the source | Scope growth → wrong quote. Ground every field; tag inferences `(inf.)`. |
| Made a human actor (e.g. ambassador) its own object by default | A human is a Person + role flag first; an object only if it needs its own pipeline/reporting. |
| Flagged an automation as "Workflow" | Prescribes the build, penalizes app-builders. Present both. |
| Flagged a limit with no fix | Dead-end flag. Pair every problem with a path. |
| "(only what they asked for)" / feature-tour prose | Editorialising. State the content; don't narrate the obvious. |
| First-person "not ours" in a partner doc | Say "Twenty." The doc is forwarded verbatim. |
| Local file paths in the output | Mean nothing to a partner. Cite `docs.twenty.com` only. |
| `§3` as prose; fields modelled but not relationships | Use a per-object field **table**; model the links, not just attributes. |
| Hard-wrapped mid-sentence / used `~` | Broken lines / accidental strikethrough. One line per paragraph; "around" not `~`. |
| Wrote up the vendor's corporate status / legal domicile / ownership / CEO sign-off | Backstory, not a build input. Record only the **consequence**: requirement → the client's path; gate the open item as a ❓ in §11. |
| Filled a thin brief with an elaborate inferred model | Over-reach scares a hesitant buyer with unrequested scope. Model the few certain objects; flag the rest as ❓; say it's a minimal sketch. |
| Added an Integrations section with connectors the customer never named | Integrations is conditional, not default. Omit it absent a named system; at most flag one ❓. |
| Kept buyer characterisations / competitor asides / internal timelines | Not customer-safe. State needs neutrally; cut the rest. |
| Listed source materials / who-promised-what in the header | Not customer-safe and not load-bearing. Drop it. |
