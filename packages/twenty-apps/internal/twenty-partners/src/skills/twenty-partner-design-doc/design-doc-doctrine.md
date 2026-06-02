# Design-doc doctrine: translating a lead into Twenty terms

**Portable doctrine.** This file is tool-agnostic. It defines *what* a Twenty partner design doc is, its structure, the rules, and how to verify it. Two consumers use it: the Claude Code skill `twenty-partner-design-doc` (see `SKILL.md` in this folder), and, in a later phase, the `content` of a Twenty `defineSkill` driving an in-product agent. Keep it free of any one tool's mechanics (no file paths, no tool names).

## Purpose

Produce a **design doc** that translates a qualified lead's needs into **Twenty terms** (data model, permissions, integrations, hosting, plus whatever else the client named) so an implementation **partner can scope and quote** the work.

**Core principle:** identify *all* the work with **no blindspots**, **ground every claim** in the source or in live Twenty docs, and **present options rather than prescribe**. The partner quotes off this doc, so a confident-but-wrong capability claim or a hidden requirement is the worst failure.

**Stay on the client's outcome.** Every line must change what the partner *builds* or what the client *receives*. The doc is a design, not a meeting record: a requirement's backstory (why the vendor or a third party does or doesn't satisfy it) is not a build input. Capture the **consequence**, cut the backstory.

The doc is **partner-facing** and may be forwarded verbatim. It is a *suggestion to make scoping easier*, not a spec that constrains how the partner builds.

## Output structure

**Header: a compact table, not a stack of bold lines.** Four fields only:

| Field | Value |
|---|---|
| Lead | name (one-line description of who they are) |
| Date | YYYY-MM-DD |
| Author | Twenty (partnerships) |
| Status | one short line (e.g. "Draft for partner review") |

Keep the header to those four fields. The Status line stays short: a load-bearing caveat (e.g. "data model is an inference pending discovery") goes in the "What this is" callout, not in the header cell. Do not list source materials, internal timelines, or who-promised-what: not load-bearing, not customer-safe (the doc is forwarded verbatim).

After the table, one **"What this is"** callout framing the doc as a partner-scoping suggestion across the full surface, *not* an MVP.

**Flag legend (emoji + short text label, used together so they're scannable and unambiguous):**

- `🔮 inf.` modelling inference (yours; the partner should confirm with the client). Used inline, often, unbolded.
- **❓ open** open question to resolve before quoting.
- **⚠️ heavy** product-constrained or needs special design / has a real cost.
- **🛑 blocker** dealbreaker-grade. Doesn't quote without resolution.

Use these four pairings only. Don't invent new flags, swap the emoji (🟥 / 🚩 / 🚨 / ✅), or drop the text label and use the emoji alone.

### Required sections (always present)

Number sequentially in the final doc, with no gaps:

- **Context**: the 30-second read: who they are, what they want, deployment requirement, scale, language/region.
- **Data model in Twenty terms**: the core. Present objects as a **table, one row per object**: `Object | Std/Custom | Source | Represents | Key fields | Core relations`. The **Source** column is `client` (object/concept grounded in client speech) or `inf.` (you coined it). Inline, tag inferred field names and relations `🔮 inf.`. Spell out SELECT option sets. **Model the relationships, not just the fields**: who introduced/sourced a record (e.g. an ambassador to Opportunity `sourcedBy` link), parent/child, ownership carry as much scoping signal as the attributes. State product constraints **only when they change the build or quote**, and inline (no formula fields → reporting ratios need a logic-function-maintained stored field; custom objects auto-get attachments/notes/tasks/timeline → relationship tracking is free). Where a customer term collides with a Twenty term (their "partner" = a donor), note the mapping inline as a small "term collisions" bullet list above the table; do **not** add a glossary section for it.
- **Roles, permissions & RLS**: map named roles to Twenty's object / field / row-level model; answer "do we need RLS?" against verified, plan-gated capability.
- **Hosting & compliance**: cloud vs self-host, data-residency requirement (verify), GDPR. Flag contradictions.
- **Suggested phasing**: "(the partner's call, not Twenty's)" layers, labelled a suggestion.
- **Open questions / blindspot-killers**: the list a partner must resolve before pricing. **This is the one explicit exception to "tables over bullets": always render as a numbered list**, so the partner can speak them as items 1, 2, 3 with the client. Each item names the decision the question gates and links back to the body section with a functional cross-ref.
- **References & verification**: a table mapping each load-bearing claim to its source doc, plus an explicit list of what the docs could NOT confirm (the unresolved **❓ open** items).

### Conditional sections (include only when grounded in client speech)

If the client didn't name the topic, **omit the section entirely**. Do not include a section just to say "X was not named" — that's filler. Unknowns belong in Open questions, not in their own section.

- **Views & navigation**: include when the data model has enough scope to warrant a surface conversation. Render as a **tight table** with columns `Surface | Shows | Audience`, one row per surface (an object or a filtered subset) the workspace should expose day-to-day. **Do not** add a `Type` column (table / kanban / page layout): the view type is the partner's call, not a scoping decision. If the client explicitly named pipelines or layouts, capture them in the `Shows` cell. Keep the table to the surfaces that genuinely matter; supplement with a one-line follow-up bullet only when an open question about a cross-cutting surface needs flagging (e.g. an unscoped admin view).
- **Automations**: only if the client named processes to automate. Give Workflow-or-logic-function for each; name the automation and its trigger.
- **Integrations**: only when the client explicitly names an external system to connect (Gmail, Slack, WhatsApp, etc.). Direction, indicative mechanism (not prescriptive), data flow, risks. If you spot a likely integration that wasn't named, raise it as a single **❓ open** in Open questions, not as a whole section.
- **Reporting & analytics**: only if the client named reporting needs. Map them to native Dashboards; flag gaps with paths.

Number whatever you include sequentially. A doc with Context, Data model, Integrations (Gmail named), Permissions, Hosting, Phasing, Open questions, References is §1 through §8. Don't leave gaps.

Scale each section to its content. **Coverage of surface area matters more than depth per item.**

## Rules (and why each matters)

- **Be concise: maximum signal per word.** Say a lot in few words. Cut throat-clearing, scene-setting, hedges, and feature-tour prose; prefer a table or a tight clause to a paragraph. Length is not coverage: a short doc that names every requirement beats a long one that pads each. A hesitant buyer reads a focused doc; a bloated one reads as cost.
- **Bullets and tables over paragraphs, with one exception.** Default to bullets; reach for a table whenever rows share structure (objects, views, plans, paths). Use prose only for a nuance no bullet or table cell can carry. The Open questions section is the deliberate exception: always a numbered list, so the partner can read item 1, 2, 3 aloud.
- **Business decisions over technical mechanics.** Scope is what the partner *builds* and what the client *receives*: data sensitivity, who-sees-what, plan choice, hosting choice, integration surface, cost drivers. Cut SDK / runtime / build-tool internals that don't change the quote (Docker version, OAuth flavour, auto-system relations, env-var names, version-control workflow). The partner reads References for the docs that cover those.
- **Fact vs inference is the primary visibility split.** Plain prose = stated by the client. `🔮 inf.` tag inline = your modelling guess, every time it appears. The Data-model table carries a **Source** column (`client` / `inf.`). A partner skimming the doc must be able to see at a glance which lines they need to confirm with the client.
- **Section cross-references are functional anchor links.** Every `§N` reference must be a markdown anchor link: `[§N](#n-section-slug)`. The slug follows GitHub Flavored Markdown auto-anchoring (lowercase; spaces → hyphens; punctuation dropped; `&` removed leaving a double hyphen). A bare `§N` is unreadable to a partner skimming the doc, who just sees numbers with no way to jump.
- **No "left out" / "not named" placeholders.** The doc speaks only about content grounded in the source. A bullet that says *"sessions/programmes/schools left out on purpose"* or a section that says *"no reporting was named"* is filler: cut it. If you want to flag the absence, write it as a question in Open questions ("Are sessions/programmes first-class objects?") that gates a specific decision; otherwise, silence.
- **Never repeat yourself.** State each fact, constraint, or claim once, in its home section; elsewhere link to it (functional `[§N](...)`) rather than restate. Open questions and References are deliberate roll-ups: there, give the pointer and the decision the item gates, not a re-explanation of the body. Repetition is the main source of bloat, and two copies of a claim drift out of sync.
- **Scope altitude: name the decision, defer the mechanics.** A design doc scopes the work; it is not the technical implementation spec. State the *decision* and its *cost or scope consequence*; leave the implementation nitty-gritty (specific env-var names, runtime internals, isolation models, SDK function signatures) to the later technical phase. Example: "production automations need a sandboxed/serverless logic-function backend, an infra cost that belongs in the platform workstream" carries the quote signal; the exact `LOGIC_FUNCTION_TYPE` / `LAMBDA` / region/role/key settings do not belong in a scoping doc. Deep mechanics inflate length and date fast without changing the quote.
- **Ground everything; tag inferences `🔮 inf.`; never grow scope.** The partner quotes off this, so an invented field or requirement inflates the quote or sets a false expectation. If the *concept* is from the source but the *field name* is yours, that is an inference: tag it. Values lifted from the source (the customer's own category list becoming SELECT options) are *grounded*; only names/fields you coin are inferences.
- **Record the design consequence, not the backstory.** State a requirement and the **client's path** that follows from it; do not litigate *why* it's true. When a requirement traces to vendor-internal or third-party detail (corporate structure, legal domicile, ownership, internal commercial arrangements, who-confirms-what-with-whom), keep only the consequence: it is a commercial matter, not a build input, however much airtime it got on the call. An open item the client is waiting on is recorded as the **decision it gates** (a **❓ open** in Open questions), not as a narrative of the vendor's situation.
- **Database discipline: reuse and extend standard objects; add a custom object only at a genuine wall.** Company / Person / Opportunity plus the built-in Notes / Tasks / Timeline cover most CRM needs; every new object multiplies build and maintenance. A **human actor is a Person with a role flag before it is a new object**: create an object only when it needs its own pipeline or reporting. Name the wall when you add one.
- **When the brief is thin, under-reach the inferred model; don't fill the gap.** A blurry situation (no discovery call, sparse notes) is a reason to model the *fewest, most certain* objects and leave the rest as **❓ open** open questions, not to compensate with an elaborate inferred domain. An over-detailed inference reads as scope and cost the customer never asked for and can scare a hesitant buyer off. Lead with standard objects plus the one or two custom objects the domain unmistakably needs; everything else is a question to confirm, not a row in the table. Say plainly, up front, that the model is a minimal starting sketch to validate.
- **Present build approaches; don't prescribe.** An automation can be a no-code Workflow *or* a logic function in an app: say both. Prescribing one penalizes a partner who would do the other. The doc identifies the *need*, not the *build*.
- **Every problem carries a path; never a dead-end flag.** If you flag a constraint (e.g. dashboards can't share externally), pair it with at least one solution (CSV export, a front-component, a public site on the API) or a question that resolves it. A flag with no path is useless to someone pricing the work.
- **Flag what an approach can't satisfy.** The doc's value is surfacing walls and limits per requirement so the partner prices around them, not picking the one true solution.
- **Partner-facing voice.** Say **"Twenty," never first person** ("we / our / ours"). **No local file paths** in the output: cite shareable `docs.twenty.com` URLs only. (Customer quotes that contain "we/our" are fine: they are quotes.)
- **No characterisations or asides; only requirements and capabilities.** The doc is customer-forwardable, so keep out the source chat's off-hand remarks: characterisations of the buyer (budget, temperament, sophistication), named comparisons to competing vendors, and internal partnerships notes (deadlines, who promised what). If price-sensitivity or a competitor displacement genuinely shapes the build, state it neutrally as a requirement (e.g. cost is a selection criterion), never as a quote or judgement.
- **Verify before asserting capability.** Any "Twenty can / can't / has / lacks X" that moves the quote must be verified live (see Verification). **Undocumented ≠ impossible.**

## Formatting

- One line per paragraph: **no mid-sentence hard wraps** (they render as broken lines).
- **Never use em dashes (the long dash).** Restructure the sentence, or use a colon, comma, parentheses, or a period instead.
- **Never a bare `~`** for "approximately": GitHub markdown pairs `~...~` into strikethrough. Write "around" / "about".
- **Flags are the four emoji + text pairs only** (`🔮 inf.`, `**❓ open**`, `**⚠️ heavy**`, `**🛑 blocker**`). Don't swap the emoji or drop the text label.
- **Section cross-references are functional anchor links** (`[§N](#n-section-slug)`), never bare `§N`.
- Mark unverified capability claims `**❓ open**`, never as fact.

## Verification

Any statement of the form **"Twenty can / can't / has / lacks X"** that changes the partner's quote MUST be verified **live** before it is stated as fact. Model training is stale on a fast-moving product; the worst failure is a confident, authoritative-sounding claim that is wrong.

**Source hierarchy (what to trust, in order):**
1. **Live docs** (`docs.twenty.com`): primary truth. For the highest-stakes claims, read the page's primary text rather than trust a summary.
2. **Established Twenty SDK build patterns** (hands-on): build-level facts the customer docs omit (no formula fields; custom objects auto-get attachments/notes/tasks/timeline; two-file relations).
3. **The Twenty operator** (a Twenty team member): best for "is it shipped / internal / undocumented."
4. **Model training**: never the sole basis for a high-stakes claim.

**Right doc layer (the trap):** capabilities live in two layers, so check the right one.
- **Product capabilities** (what the CRM does for the *customer*): the **user guide + pricing page**. Covers roles / row-level permissions, dashboards, plans, hosting, data residency.
- **App capabilities** (what an *app* can define): the **developer/extend** docs. Covers field types, fields, logic functions, views, page layouts.
Checking only the app layer is how "row-level not supported" (wrong) happens: row-level is a **product feature on the Organization plan**. The converse also holds: SDK build patterns *are* sufficient to assert **build-layer** facts even when the customer docs are silent (e.g. auto system relations), so do not demote a well-established build fact to **❓ open**.

**Always verify (the load-bearing checklist), live, every run:**
1. Field types & constraints (e.g. no formula/computed fields).
2. Standard-object extension & relabeling (add fields ✓; relabel / edit built-in SELECT options?).
3. Roles & permissions: object / field / row-level, and plan-gating (which tier).
4. Dashboards & reporting: chart/widget types, beta status, export / external-sharing limits.
5. Automation surfaces: Workflows vs logic functions, what each can do.
6. Integration mechanisms: webhooks, HTTP triggers, scheduled functions, connections.
7. Hosting & deployment: cloud plans & regions / **EU data residency**, self-host availability & requirements.
Plus: any other capability claim the draft makes that carries a **⚠️ heavy** or **❓ open** flag.

**Fallback chain:**
- Docs confirm → state it as fact; record the source in References.
- Docs silent or ambiguous → ask the operator (if available).
- Operator unavailable or unsure → render it as a **❓ open** open question. **Never assert.** When you fetched a page and it was simply *silent*, record that as "docs silent (URL)" rather than leaving the claim unsourced.

**References appendix format:** a `Claim (§) | Verified against` table, then an explicit "**Could not be confirmed in public docs (check with Twenty directly):**" list. Unverified items stay **❓ open** in the body too, never silently promoted to fact. Cite the **human-readable (non-`.md`) URL** here: the `.md` twin is for *your* fetch, not for the partner (a `.md` link renders as raw markdown in a browser).

**Where to verify (Twenty doc map):** docs base = `https://docs.twenty.com/`. Fetch **`<path>.md`** for the clean markdown twin (the form to prefer). Paths:
- Product / user-guide: `user-guide/dashboards/overview` · `user-guide/dashboards/capabilities/widgets` · `user-guide/permissions-access/how-tos/permissions-faq` · `user-guide/data-model/overview` · `user-guide/data-model/capabilities/fields` · `user-guide/data-migration/how-tos/export-your-data`
- Developer / extend: `developers/extend/apps/data/objects` · `developers/extend/apps/data/extending-objects` · `developers/extend/apps/data/relations` · `developers/extend/apps/logic/logic-functions` · `developers/extend/apps/logic/connections` · `developers/extend/apps/layout/views` · `developers/extend/apps/layout/page-layouts` · `developers/extend/apps/config/roles`
- Self-host: `developers/self-host/self-host`
- Pricing & plans: `https://twenty.com/pricing` (**marketing page, no `.md`**; fetch as HTML).
If a `.md` 404s, drop the suffix or re-derive from the docs index: the map can go stale.

## Common mistakes

| Mistake | Reality / fix |
|---|---|
| "Twenty isn't a BI tool" / "can't do row-level" | Stale training. Twenty has Dashboards; row-level is on the Organization plan. **Verify live.** |
| Checked only the app-SDK doc for a product capability | Row-level lives in the product/pricing layer. **Verify the right layer.** |
| Added fields not in the source | Scope growth, wrong quote. Ground every field; tag inferences `🔮 inf.`. |
| Made a human actor (e.g. ambassador) its own object by default | A human is a Person + role flag first; an object only if it needs its own pipeline/reporting. |
| Flagged an automation as "Workflow" | Prescribes the build, penalizes app-builders. Present both. |
| Flagged a limit with no fix | Dead-end flag. Pair every problem with a path. |
| Spelled out runtime/env-var mechanics (`LOGIC_FUNCTION_TYPE` / `LAMBDA`, region/role/key, Docker version, OAuth flavour, CI/CD workflow detail) | Wrong altitude. Name the decision + its cost; defer the mechanics to the technical phase. |
| Same point restated across sections | State it once in its home section; cross-reference with a functional `[§N](...)` link. |
| Padded prose / feature-tour narration | Maximum signal per word. State the content; cut the scene-setting. |
| Added a domain-language map / glossary section | Removed. Note a genuine term collision inline in Data model; no standalone glossary. |
| First-person "not ours" in a partner doc | Say "Twenty." The doc is forwarded verbatim. |
| Local file paths in the output | Mean nothing to a partner. Cite `docs.twenty.com` only. |
| Data-model section as prose; fields modelled but not relationships | Use a per-object field **table**; model the links, not just attributes. |
| Hard-wrapped mid-sentence / used `~` / used an em dash | Broken lines / accidental strikethrough / banned dash. One line per paragraph; "around" not `~`; colon or comma, never an em dash. |
| Used an emoji other than the four canonical (🟥 / 🚩 / 🚨 / ✅), or used the emoji without the text label | Stick to `🔮 inf.`, `**❓ open**`, `**⚠️ heavy**`, `**🛑 blocker**`. The text label disambiguates. |
| Section is mostly paragraphs | Default to bullets and tables; prose only when a nuance can't fit a list. Exception: Open questions stays a numbered list. |
| Included build / runtime / SDK mechanics that don't move the quote | Wrong altitude. Business decisions, scope consequences, and References only; mechanics belong in the later technical phase. |
| Data-model table missing a Source column | Partner can't see at a glance which rows the client confirmed vs which are your inferences. Add `client` / `inf.`. |
| Cross-references are bare `§N` instead of functional links | The partner sees disconnected numbers and can't navigate. Use `[§N](#n-section-slug)` everywhere. |
| Included a section that just says "X was not named" / "no automations named" / a "left out on purpose" list | Cut the whole section / bullet. Unknowns go in Open questions; the doc speaks only about grounded content. |
| Renumbered with gaps (e.g. cut Reporting but kept §5-§11 numbering as §5, §6, §8) | Renumber sequentially, no gaps. A partner doesn't know which sections were omitted. |
| Views section prescribed the view type (table / kanban / page layout) | The partner picks the view type. List **what to surface** (objects, subsets, who they're for), not **how**. |
| Views section rendered as a bullet list | Render as a `Surface \| Shows \| Audience` table; supplement with a follow-up bullet only for a cross-cutting open question. |
| Wrote up the vendor's corporate status / legal domicile / ownership / sign-off | Backstory, not a build input. Record only the **consequence**: requirement → the client's path; gate the open item as **❓ open** in Open questions. |
| Filled a thin brief with an elaborate inferred model | Over-reach scares a hesitant buyer with unrequested scope. Model the few certain objects; flag the rest as **❓ open**; say it's a minimal sketch. |
| Added an Integrations section with connectors the customer never named | Integrations is conditional, not default. Omit it absent a named system; at most flag one **❓ open**. |
| Kept buyer characterisations / competitor asides / internal timelines | Not customer-safe. State needs neutrally; cut the rest. |
| Listed source materials / who-promised-what in the header, or stacked it as bold lines | Header is a four-field table. Not customer-safe content goes nowhere. |
