# Design-doc doctrine: translating a lead into Twenty terms

**Portable doctrine.** Tool-agnostic. It defines *what* a Twenty partner design doc is, its
structure, the rules, and how to verify it. Two consumers use it: the Claude Code skill
`twenty-lead-brief` (see `SKILL.md` in this folder), and, in a later phase, the `content` of
a Twenty `defineSkill` driving an in-product agent. Keep it free of any one tool's mechanics
(no file paths, no tool names).

Every rule lives here **once**. To restate one elsewhere, link to it instead.

## Purpose

Produce a doc that translates a qualified lead's needs into **Twenty terms** (data model,
permissions, integrations, hosting, plus whatever else the client named) so an
implementation **partner can scope and quote** the work.

**Core principle:** identify *all* the work with **no blindspots**, **ground every claim** in
the source or in live Twenty docs, and **present options rather than prescribe**. The partner
quotes off this doc, so a confident-but-wrong capability claim or a hidden requirement is the
worst failure.

**Stay on the client's outcome.** Every line must change what the partner *builds* or what
the client *receives*. The doc is a design, not a meeting record.

The doc is **partner-facing** and may be forwarded verbatim. It is a *suggestion to make
scoping easier*, not a spec that constrains how the partner builds.

## Output structure

**Header: a compact table, four fields only.** Never a stack of bold lines.

| Field | Value |
|---|---|
| Lead | name (one-line description of who they are) |
| Date | YYYY-MM-DD |
| Author | Twenty (partnerships) |
| Status | one short line (e.g. "Draft for partner review") |

Keep the Status line short: a load-bearing caveat (e.g. "data model is an inference pending
discovery") goes in the "What this is" callout, not in the header cell. Never list source
materials, internal timelines, or who-promised-what: not load-bearing, not customer-safe.

After the table, one **"What this is"** callout framing the doc as a partner-scoping
suggestion across the full surface, *not* an MVP.

### Flags

Emoji **and** short text label, always together, so they are scannable and unambiguous:

- **❓ open** open question to resolve before quoting.
- **⚠️ heavy** product-constrained, needs special design, or has a real cost.
- **🛑 blocker** dealbreaker-grade. Doesn't quote without resolution.

These three only. Never invent a flag, swap the emoji (🟥 / 🚩 / 🚨 / ✅), or drop the text
label. `--full` mode adds a fourth, `🔮 inf.`.

### Required sections

Number sequentially, no gaps. A doc with Context, Data model, Integrations, Permissions,
Hosting, Phasing, Open questions, References is §1 through §8.

**Context** — the 30-second read: who they are, what they want, deployment requirement,
scale, language and region.

**Data model in Twenty terms** — the core. A **table, one row per object**:
`Object | Std/Custom | Represents | Key fields | Core relations`. Only objects the client
explicitly named; only fields the client explicitly named; `—` for an empty cell. Spell out
SELECT option sets.

**Model the relationships, not just the fields.** Who introduced or sourced a record (an
ambassador to Opportunity `sourcedBy`), parent and child, ownership: these carry as much
scoping signal as the attributes. A data-model section written as prose, or one that lists
fields but no links, has missed the point.

State product constraints **only when they change the build or the quote**, and inline: no
formula fields, so reporting ratios need a logic-function-maintained stored field; custom
objects auto-get attachments, notes, tasks and timeline, so relationship tracking is free.

Where a customer term collides with a Twenty term (their "partner" is a donor), note the
mapping inline as a small "term collisions" bullet list above the table. Never add a glossary
section.

**Roles, permissions & RLS** — map named roles to Twenty's object, field and row-level model.
Answer "do we need RLS?" against verified, plan-gated capability.

**Hosting & compliance** — cloud vs self-host, data-residency requirement (verify), GDPR.
Flag contradictions.

**Suggested phasing** — layers, labelled "(the partner's call, not Twenty's)".

**Open questions / blindspot-killers** — the list a partner must resolve before pricing.
**The one exception to "tables over bullets": always a numbered list**, so the partner can
speak them as items 1, 2, 3 with the client. Each item names the decision it gates and links
back to its body section.

**References & verification** — a `Claim (§) | Verified against` table, then an explicit
"**Could not be confirmed in public docs (check with Twenty directly):**" list. Cite the
**human-readable (non-`.md`) URL**: the `.md` twin is for your fetch, and renders as raw
markdown in a partner's browser.

### Conditional sections

If the client didn't name the topic, **omit the section entirely**. Never include a section
to say "X was not named": that is filler. Unknowns belong in Open questions.

**Views & navigation** — include when the data model has enough scope to warrant a surface
conversation. A **tight table**, columns `Surface | Shows | Audience`, one row per surface
the workspace should expose day-to-day. **No `Type` column**: table vs kanban vs page layout
is the partner's call, not a scoping decision. If the client named pipelines or layouts,
capture them in `Shows`. Never render this as a bullet list. Supplement with a single
follow-up bullet only when a cross-cutting open question needs flagging.

**Automations** — only if the client named processes to automate. Give
Workflow-or-logic-function for each; name the automation and its trigger.

**Integrations** — only when the client explicitly names an external system (Gmail, Slack,
WhatsApp). Direction, indicative mechanism, data flow, risks. A likely integration the client
never named is a single **❓ open**, not a section.

**Reporting & analytics** — only if the client named reporting needs. Map to native
Dashboards; flag gaps with paths.

Scale each section to its content. **Coverage of surface area matters more than depth per
item.**

## Default behavior: zero inference

The default output is a **zero-inference partner brief**: sharp, small, strictly grounded.

- **Nothing is inferred.** If the client didn't say it, it doesn't appear.
- **Required sections with no grounded content** get exactly one line:
  `> ⬜ Not discussed on call — needs input before this section can be filled.`
- **Conditional sections** with nothing grounded are omitted entirely. The placeholder is for
  required sections only.
- **Data-model cells** with no grounded content get `—`, never an invented value.
- **No `Source` column** in the data-model table: every row is `client`, so the column is
  noise.
- **`🔮 inf.` never appears.** If you want to use it, that line should not exist.
- **Target length: 1 page.** Each section 1 to 5 lines.
- **Verification** runs only for sections with grounded content.
- Filename: `YYYY-MM-DD-<lead>-partner-brief.md`.

## Full mode (`--full`)

Use when discovery is complete, the lead is well documented, and inferences give the partner
a richer starting model.

| Dimension | Default | `--full` |
|---|---|---|
| Inferences | never | allowed, tagged `🔮 inf.` |
| Empty section | placeholder line | filled with tagged inferences |
| Data-model `Source` column | omitted | `client` / `inf.` |
| Inferred field names and relations | not included | tagged `🔮 inf.` |
| Length | 1 page target | as long as content requires |
| Verification | grounded sections only | all load-bearing claims |
| Filename | `…-partner-brief.md` | `…-design-doc.md` |

## Rules

Each rule states what to do and the failure it prevents.

**Be concise: maximum signal per word.** Cut throat-clearing, scene-setting, hedges and
feature-tour prose. Length is not coverage: a short doc that names every requirement beats a
long one that pads each. A hesitant buyer reads a focused doc; a bloated one reads as cost.

**Bullets and tables over paragraphs.** Reach for a table whenever rows share structure
(objects, views, plans, paths). Use prose only for a nuance no bullet or cell can carry. The
Open questions numbered list is the single deliberate exception.

**Business decisions over technical mechanics.** Scope is what the partner *builds* and what
the client *receives*: data sensitivity, who-sees-what, plan choice, hosting choice,
integration surface, cost drivers. Cut SDK, runtime and build-tool internals that don't move
the quote: Docker version, OAuth flavour, auto-system relations, env-var names, CI/CD
workflow detail. The partner reads References for those.

**Scope altitude: name the decision, defer the mechanics.** State the *decision* and its
*cost or scope consequence*; leave implementation detail to the technical phase. "Production
automations need a sandboxed serverless logic-function backend, an infra cost that belongs in
the platform workstream" carries the quote signal. The exact `LOGIC_FUNCTION_TYPE` /
`LAMBDA` / region / role / key settings do not. Deep mechanics inflate length and date fast.

**Ground everything; tag inferences; never grow scope.** The partner quotes off this, so an
invented field or requirement inflates the quote or sets a false expectation. If the
*concept* is from the source but the *field name* is yours, that is an inference: tag it.
Values lifted from the source (the customer's own category list becoming SELECT options) are
grounded; only names you coin are inferences.

**Record the design consequence, not the backstory.** State a requirement and the client's
path that follows. Do not litigate *why* it is true. When a requirement traces to
vendor-internal or third-party detail (corporate structure, legal domicile, ownership,
internal commercial arrangements, who-confirms-what-with-whom), keep only the consequence: it
is a commercial matter, not a build input, however much airtime it got on the call. An open
item the client is waiting on is recorded as the **decision it gates**, not as a narrative.

**No "left out" or "not named" placeholders.** A bullet saying *"sessions and programmes left
out on purpose"*, or a section saying *"no reporting was named"*, is filler. Cut it. To flag
an absence, write it as an Open question that gates a specific decision. Otherwise, silence.

**Never repeat yourself.** State each fact once, in its home section; elsewhere link to it.
Open questions and References are deliberate roll-ups: give the pointer and the decision the
item gates, not a re-explanation. Repetition is the main source of bloat, and two copies of a
claim drift out of sync.

**Cross-references are functional anchor links.** `[§N](#n-section-slug)`, never a bare `§N`.
The slug follows GitHub auto-anchoring: lowercase, spaces to hyphens, punctuation dropped,
`&` removed leaving a double hyphen. A partner skimming a bare `§7` sees a number with no way
to jump.

**Database discipline: reuse and extend standard objects.** Company, Person and Opportunity
plus built-in Notes, Tasks and Timeline cover most CRM needs; every new object multiplies
build and maintenance. **A human actor is a Person with a role flag before it is a new
object**: create an object only when it needs its own pipeline or reporting. Name the wall
when you add one.

**When the brief is thin, under-reach.** A blurry situation (no discovery call, sparse notes)
is a reason to model the *fewest, most certain* objects and leave the rest as **❓ open**, not
to compensate with an elaborate inferred domain. An over-detailed inference reads as scope
and cost the customer never asked for, and scares a hesitant buyer off. Lead with standard
objects plus the one or two custom objects the domain unmistakably needs. Say plainly, up
front, that the model is a minimal starting sketch to validate.

**Present build approaches; don't prescribe.** An automation can be a no-code Workflow *or* a
logic function in an app: say both. Prescribing one penalizes a partner who would do the
other. The doc identifies the *need*, not the *build*.

**Every problem carries a path.** If you flag a constraint (dashboards can't share
externally), pair it with at least one solution (CSV export, a front-component, a public site
on the API) or a question that resolves it. A flag with no path is useless to someone pricing
the work.

**Flag what an approach can't satisfy.** The doc's value is surfacing walls and limits per
requirement so the partner prices around them, not picking the one true solution.

**Partner-facing voice.** Say **"Twenty," never first person** ("we", "our", "ours"). No
local file paths: cite shareable `docs.twenty.com` URLs only. Customer quotes containing
"we" or "our" are fine: they are quotes.

**No characterisations or asides.** The doc is customer-forwardable, so keep out the source
chat's off-hand remarks: characterisations of the buyer (budget, temperament,
sophistication), named comparisons to competing vendors, and internal partnerships notes
(deadlines, who promised what). If price-sensitivity or a competitor displacement genuinely
shapes the build, state it neutrally as a requirement, never as a quote or a judgement.

**Verify before asserting capability.** Any "Twenty can, can't, has or lacks X" that moves
the quote must be verified live. **Undocumented is not impossible.** See Verification.

### Formatting

- One line per paragraph. **No mid-sentence hard wraps**: they render as broken lines.
- **Never an em dash** (the long dash). Restructure, or use a colon, comma, parentheses, or a
  period.
- **Never a bare `~`** for "approximately": GitHub markdown pairs `~…~` into strikethrough.
  Write "around" or "about".
- Mark unverified capability claims **❓ open**, never as fact.

## Verification

Any statement of the form **"Twenty can, can't, has or lacks X"** that changes the partner's
quote MUST be verified **live** before it is stated as fact. Model training is stale on a
fast-moving product; the worst failure is a confident, authoritative-sounding claim that is
wrong.

**Source hierarchy:**

1. **Live docs** (`docs.twenty.com`): primary truth. For the highest-stakes claims, read the
   page's primary text rather than trust a summary.
2. **Established Twenty SDK build patterns** (hands-on): build-level facts the customer docs
   omit (no formula fields; custom objects auto-get attachments, notes, tasks and timeline;
   two-file relations).
3. **The Twenty operator** (a Twenty team member): best for "is it shipped, internal, or
   undocumented".
4. **Model training**: never the sole basis for a high-stakes claim.

**Right doc layer (the trap).** Capabilities live in two layers, so check the right one.

- **Product capabilities** (what the CRM does for the *customer*): the **user guide and
  pricing page**. Covers roles, row-level permissions, dashboards, plans, hosting, data
  residency.
- **App capabilities** (what an *app* can define): the **developer and extend** docs. Covers
  field types, fields, logic functions, views, page layouts.

Checking only the app layer is how "row-level not supported" (wrong) happens: row-level is a
**product feature on the Organization plan**. The converse also holds: SDK build patterns
*are* sufficient to assert **build-layer** facts even when the customer docs are silent, so
do not demote a well-established build fact to **❓ open**.

Two claims are stale in model training and must always be checked: "Twenty isn't a BI tool"
(it has Dashboards) and "Twenty can't do row-level" (Organization plan).

**Always verify, live, every run:**

1. Field types and constraints (no formula or computed fields).
2. Standard-object extension and relabeling (add fields; relabel built-in SELECT options?).
3. Roles and permissions: object, field and row-level, and which plan tier gates them.
4. Dashboards and reporting: chart and widget types, beta status, export and
   external-sharing limits.
5. Automation surfaces: Workflows vs logic functions, what each can do.
6. Integration mechanisms: webhooks, HTTP triggers, scheduled functions, connections.
7. Hosting and deployment: cloud plans and regions, **EU data residency**, self-host
   availability and requirements.

Plus any other capability claim the draft makes that carries a **⚠️ heavy** or **❓ open**.

**Fallback chain:**

- Docs confirm the claim, so state it as fact and record the source in References.
- Docs are silent or ambiguous, so ask the operator, if one is available.
- The operator is unavailable or unsure, so render it as **❓ open**. **Never assert.** When
  you fetched a page and it was simply silent, record "docs silent (URL)" rather than leaving
  the claim unsourced.

**Doc map.** Base `https://docs.twenty.com/`. Fetch **`<path>.md`** for the clean markdown
twin.

- Product and user-guide: `user-guide/dashboards/overview` ·
  `user-guide/dashboards/capabilities/widgets` ·
  `user-guide/permissions-access/how-tos/permissions-faq` · `user-guide/data-model/overview` ·
  `user-guide/data-model/capabilities/fields` ·
  `user-guide/data-migration/how-tos/export-your-data`
- Developer and extend: `developers/extend/apps/data/objects` ·
  `developers/extend/apps/data/extending-objects` · `developers/extend/apps/data/relations` ·
  `developers/extend/apps/logic/logic-functions` ·
  `developers/extend/apps/logic/connections` · `developers/extend/apps/layout/views` ·
  `developers/extend/apps/layout/page-layouts` · `developers/extend/apps/config/roles`
- Self-host: `developers/self-host/self-host`
- Pricing and plans: `https://twenty.com/pricing` (**marketing page, no `.md`**, fetch as
  HTML).

If a `.md` 404s, drop the suffix or re-derive from the docs index: the map can go stale.

## Self-check

Run this list against the finished draft. Every item restates a rule above; this is the
scannable form, not a new rule set.

**Hard failures, fix before saving:**

- [ ] An em dash anywhere.
- [ ] A bare `~` for "approximately".
- [ ] First-person voice ("we", "our") outside a customer quote.
- [ ] A local file path.
- [ ] A header that is not the four-field table.
- [ ] A flag that is not `**❓ open**`, `**⚠️ heavy**` or `**🛑 blocker**` (plus `🔮 inf.` in
      `--full`). A stray 🟥 🚩 🚨 ✅, or a naked emoji with no text label, is wrong.
- [ ] `🔮 inf.` present in default mode. Remove the whole inference, not just the tag.
- [ ] A `Source` column in the data-model table in default mode.
- [ ] A section that just says "X was not named", or lists what was left out on purpose.
- [ ] A bare `§N` instead of `[§N](#n-section-slug)`.
- [ ] Renumbering gaps: a section was cut but the numbers around it were kept.
- [ ] A capability claim stated as fact with no References source.

**Warnings, fix unless you can justify it:**

- [ ] A section that is mostly paragraphs where bullets or a table would do. Open questions
      is the exception.
- [ ] Build, runtime or SDK mechanics that don't change the quote.
- [ ] A point repeated across sections instead of a `[§N](…)` cross-reference.
- [ ] A leftover glossary or domain-language section.
- [ ] A Views table with a `Type` column, or Views rendered as a bullet list.
- [ ] An Integrations section for a system the client never named.
- [ ] Doc longer than 2 pages in default mode.
