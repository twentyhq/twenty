---
name: twenty-partner-design-doc
description: Use when turning a qualified Twenty lead — a call-summary brief plus any client braindump/docs — into a partner brief a partner can scope and quote from. Trigger when pointed at a lead folder (e.g. partners-experience/<LEAD>/) and asked to "draft a design doc", "create a partner brief", "translate this into Twenty terms", "scope this for a partner", or "prep the partner handoff". Default output is zero-inference (only what the client said; empty sections get a placeholder). Pass --full for inference mode. Chains after twenty-lead-intro-call-summary.
trigger: /twenty-partner-design-doc
---

# twenty-partner-design-doc

Turn a qualified lead's materials into a **design doc**: a translation of the customer's needs into **Twenty terms** that an implementation **partner reads to scope and quote** the work.

**The doctrine — what to produce, the 12-section structure, the rules, the verification process, and the common mistakes — lives in `design-doc-doctrine.md` in this folder. Read it and follow it.** This file is only the Claude Code wrapper: how to gather inputs, which tools to use for each step, and where to save.

## Inputs

- A lead folder (e.g. `partners-experience/<LEAD>/`) containing a `twenty-lead-intro-call-summary` output plus any braindump / docs / notes.
- If there is a raw transcript but no brief, run **twenty-lead-intro-call-summary** first — this skill chains after it.
- Read everything. Convert `.docx` with `textutil -convert txt "<file>" -output /tmp/out.txt` (macOS) or an equivalent extractor.

## Default: zero-inference partner brief

The default output is a **zero-inference partner brief**: only what the client explicitly said, nothing invented.

- `🔮 inf.` **never appears.** If you feel the urge to use it, that line should not exist.
- Required sections with no grounded content get: `> ⬜ Not discussed on call — needs input before this section can be filled.`
- Data-model table: **no Source column**; only rows for objects the client named; only fields the client named; `—` for empty cells.
- Target length: 1 page. Each section 1–5 lines max.
- Step 2: extract stated facts only. Step 4: verify only sections with grounded content.
- Step 7 self-check: `🔮 inf.` anywhere = failure (remove the whole inference); Source column = failure; doc >2 pages = warning.
- Save as `YYYY-MM-DD-<lead>-partner-brief.md`.
- See "Default behavior" in `design-doc-doctrine.md` for the full rules.

## Mode: `--full` (inference-enabled design doc)

Pass `--full` when discovery is complete and a richer inferred model is useful. Enables `🔮 inf.` tags, adds the Source column to the data model, fills gaps with inferences, and allows longer output. Save as `YYYY-MM-DD-<lead>-design-doc.md`. See "Full mode" in `design-doc-doctrine.md`.

## Steps

1. **Gather** — read all source materials in full. Coverage is the point.
2. **Extract needs, grounded** — facts vs inferences (`(inf.)`); never invent. Per the doctrine.
3. **Draft** the doc in the doctrine's 12-section structure, applying every rule in the doctrine.
4. **Verify load-bearing claims live** — use **WebFetch** against the Twenty doc map in the doctrine's Verification section before asserting any capability. Build the §11 appendix as you go.
5. **Reconcile discrepancies** — sources that disagree (call vs braindump; a name differing across/within sources) get flagged both ways, never silently resolved.
6. **Resolve ❓ with the operator** — after a full v1 draft, use **AskUserQuestion** to ask the Twenty team member the unknowns a Twenty insider can answer; leave customer-facing unknowns as ❓. **If running autonomously** (no operator — a subagent/batch run), skip the questions and leave every unknown as ❓ in the body and §11.
7. **Self-check, then save** — scan the output for: an em dash; a bare `~`; first-person voice outside customer quotes; local file paths; a header that isn't the four-field table; **any flag that isn't one of the three canonical emoji-and-text pairs** (`**❓ open**`, `**⚠️ heavy**`, `**🛑 blocker**`) — a stray 🟥, 🚩, 🚨, ✅, 🔮, or a naked emoji without its text label is wrong (in default mode `🔮 inf.` is a failure, not just a format issue; remove the whole inference); **a Data-model table that has a `Source` column** (default mode — remove it; only `--full` mode uses it); **a section that just says "X was not named" / "no automations named" / a "left out on purpose" list** — cut it, unknowns go in Open questions; **any bare `§N` reference** instead of a functional anchor link `[§N](#n-section-slug)`; **renumbering gaps** (e.g. cut a section but kept the old numbers around it); **a section that is mostly paragraphs where bullets or a table would do** — exception: Open questions stays a numbered list; **build / runtime / SDK mechanics that don't change the quote** (Docker version, OAuth flavour, auto-system relations, env-var names, CI/CD workflow detail); a point repeated across sections instead of a `[§N](...)` cross-reference; a leftover glossary / domain-language section; any capability claim stated as fact without a References source. Fix, then save to the lead folder as `YYYY-MM-DD-<lead>-partner-brief.md` (or `design-doc.md` in `--full` mode).
8. **Write partner-match-criteria.md** — always, as a third artifact alongside the brief. Save as `partner-match-criteria.md` in the same lead folder. Structure:
   - **Hard requirements** — table: Criterion | Why. Include: language/region, deployment type, data model complexity signal, migration capability, engagement model (fixed vs retainer).
   - **Strong preference** — bullets: domain familiarity, migration experience, willingness to scope for free, ability to work with non-technical end-users.
   - **Nice to have** — bullets: industry-specific workflow experience, partner size fit.
   - **Red flags** — bullets: anything that would disqualify a partner silently (language, hosting model, engagement type, technical depth).
   - **What to send the partner** — numbered steps: which files to share, what to ask the partner to confirm, when to make the intro.
   - **Matching notes** — 3–5 bullets for the partnerships team: technical nuances, prospect's sophistication level, migration unknowns, who the decision-makers are. Draw from the Open questions and Implementation complexity sections of the brief.

## Worked example

Reference: `partners-experience/TSF/2026-05-26-tsf-design-doc.md` shows the target **coverage, flag discipline, and §11 verification appendix**. It predates the current concision / table-header / no-glossary / no-em-dash rules, so where its formatting differs, **follow this doctrine over the example.**

## Notes

- Chain: **twenty-lead-intro-call-summary → twenty-partner-design-doc**; the output feeds the opportunity→partner handover (`designDocStatus` / `designDocUrl`).
- **Phase 2:** `design-doc-doctrine.md` is written to be portable. A future `defineSkill` in this app (a sibling `*.skill.ts` in `src/skills/`) would import it as its `content`, driving an in-product agent — with a verify logic-function tool replacing the WebFetch step, and a Workflow Action triggering it when sales toggles `partnerEligible`. Keep doctrine changes in that file so both the Claude Code skill and the `defineSkill` stay in sync.
