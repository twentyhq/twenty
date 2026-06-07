---
name: twenty-partner-design-doc
description: Use when turning a qualified Twenty lead — a call-summary brief plus any client braindump/docs — into an implementation design doc a partner can scope and quote from. Trigger when pointed at a lead folder (e.g. partners-experience/<LEAD>/) and asked to "draft a design doc", "translate this into Twenty terms", "scope this for a partner", or "prep the partner handoff" for a discovery-qualified prospect. Chains after twenty-lead-intro-call-summary.
trigger: /twenty-partner-design-doc
---

# twenty-partner-design-doc

Turn a qualified lead's materials into a **design doc**: a translation of the customer's needs into **Twenty terms** that an implementation **partner reads to scope and quote** the work.

**The doctrine — what to produce, the 12-section structure, the rules, the verification process, and the common mistakes — lives in `design-doc-doctrine.md` in this folder. Read it and follow it.** This file is only the Claude Code wrapper: how to gather inputs, which tools to use for each step, and where to save.

## Inputs

- A lead folder (e.g. `partners-experience/<LEAD>/`) containing a `twenty-lead-intro-call-summary` output plus any braindump / docs / notes.
- If there is a raw transcript but no brief, run **twenty-lead-intro-call-summary** first — this skill chains after it.
- Read everything. Convert `.docx` with `textutil -convert txt "<file>" -output /tmp/out.txt` (macOS) or an equivalent extractor.

## Steps

1. **Gather** — read all source materials in full. Coverage is the point.
2. **Extract needs, grounded** — facts vs inferences (`(inf.)`); never invent. Per the doctrine.
3. **Draft** the doc in the doctrine's 12-section structure, applying every rule in the doctrine.
4. **Verify load-bearing claims live** — use **WebFetch** against the Twenty doc map in the doctrine's Verification section before asserting any capability. Build the §11 appendix as you go.
5. **Reconcile discrepancies** — sources that disagree (call vs braindump; a name differing across/within sources) get flagged both ways, never silently resolved.
6. **Resolve ❓ with the operator** — after a full v1 draft, use **AskUserQuestion** to ask the Twenty team member the unknowns a Twenty insider can answer; leave customer-facing unknowns as ❓. **If running autonomously** (no operator — a subagent/batch run), skip the questions and leave every unknown as ❓ in the body and §11.
7. **Self-check, then save** — scan the output for: an em dash; a bare `~`; first-person voice outside customer quotes; local file paths; a header that isn't the four-field table; **any flag that isn't one of the four canonical emoji-and-text pairs** (`🔮 inf.`, `**❓ open**`, `**⚠️ heavy**`, `**🛑 blocker**`) — a stray 🟥, 🚩, 🚨, ✅, or a naked emoji without its text label is wrong; **a Data-model table missing the `Source` column** (`client` / `inf.`); **a section that just says "X was not named" / "no automations named" / a "left out on purpose" list** — cut it, unknowns go in Open questions; **any bare `§N` reference** instead of a functional anchor link `[§N](#n-section-slug)`; **renumbering gaps** (e.g. cut a section but kept the old numbers around it); **a section that is mostly paragraphs where bullets or a table would do** — exception: Open questions stays a numbered list; **build / runtime / SDK mechanics that don't change the quote** (Docker version, OAuth flavour, auto-system relations, env-var names, CI/CD workflow detail); a point repeated across sections instead of a `[§N](...)` cross-reference; a leftover glossary / domain-language section; any capability claim stated as fact without a References source. Fix, then save to the lead folder as `YYYY-MM-DD-<lead>-design-doc.md`.

## Worked example

Reference: `partners-experience/TSF/2026-05-26-tsf-design-doc.md` shows the target **coverage, flag discipline, and §11 verification appendix**. It predates the current concision / table-header / no-glossary / no-em-dash rules, so where its formatting differs, **follow this doctrine over the example.**

## Notes

- Chain: **twenty-lead-intro-call-summary → twenty-partner-design-doc**; the output feeds the opportunity→partner handover (`designDocStatus` / `designDocUrl`).
- **Phase 2:** `design-doc-doctrine.md` is written to be portable. A future `defineSkill` in this app (a sibling `*.skill.ts` in `src/skills/`) would import it as its `content`, driving an in-product agent — with a verify logic-function tool replacing the WebFetch step, and a Workflow Action triggering it when sales toggles `partnerEligible`. Keep doctrine changes in that file so both the Claude Code skill and the `defineSkill` stay in sync.
