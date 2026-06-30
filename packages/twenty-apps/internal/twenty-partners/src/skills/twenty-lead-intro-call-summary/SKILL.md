---
name: twenty-lead-intro-call-summary
description: Turn a sales/discovery-call transcript into a faithful, structured qualification brief for Twenty's partner/CRM pipeline. Use this whenever the user has a call recording or transcript — including a meetily recordings folder or a transcripts.json — and wants to summarize, recap, qualify, or extract a brief from a prospect/discovery call. Trigger even when they don't say "brief": phrases like "summarize this call", "what did we learn from the X call", "qualify this lead from the call", "turn this transcript into something I can hand a partner", or pointing at a transcript file all count. Produces a tight deal one-pager (company, needs, implementation complexity, does-it-need-a-partner, partner-facing brief) plus an appendix (product/GTM feedback, terminology, quotes). It is a faithful extraction, not a lossy summary.
trigger: /twenty-lead-intro-call-summary
---

# twenty-lead-intro-call-summary

Turn a discovery/sales-call transcript into a **qualification brief** that (a) loses no
decision-relevant detail and (b) can be used to qualify the deal and hand it to an
implementation partner. Designed for Twenty's partner/CRM pipeline, tuned for messy,
label-less ASR transcripts (e.g. meetily exports).

The output is two parts: a tight **Part A deal one-pager** (everything the deal/partner
work needs) and a **Part B appendix** (not deal-specific: product feedback, terminology,
quotes). The structure is what prevents loss — a "summary that loses nothing" is a
contradiction, so this is a *structured extraction* against a fixed schema where every
dimension has a slot and gaps are marked rather than silently dropped.

## Step 1 — Get the transcript

The transcript is provided by the user — usually pasted text, or a path they point you at
(a `.txt`/`.vtt`/`.srt`, or a meetily recording folder / `transcripts.json`). If they give a
path, read it: a meetily `transcripts.json` is `{ "segments": [ { "text": ... } ] }` —
concatenate the `text` values in order; for `.vtt`/`.srt`, drop the cue numbers and
timecodes.

**If no transcript is provided, ask for it before doing anything else.** Don't fabricate or
proceed without one.

For very long transcripts, read the whole thing before writing — coverage is the point.

## Step 2 — Produce the brief

Follow these rules and fill this exact schema. Why each rule matters is noted, because
faithful extraction depends on judgment, not rote form-filling.

**Rules**
- Extract ONLY what is in the transcript. Never invent or assume. If a field isn't covered,
  write "Not discussed." (Visible gaps beat confident fabrication — a missing field is a
  signal to ask on the next call.)
- Separate stated FACTS from your INFERENCES; mark any inference "(inferred)". (Downstream
  matching trusts the facts; don't contaminate them with guesses.)
- Preserve specifics verbatim: numbers, dates, names + roles, tool/CRM names, prices,
  budgets, exact requirements. Don't round or paraphrase numbers. (Specifics are where
  nuance and matching signal live; paraphrase kills them.)
- Use the customer's own words for needs and objections; quote pivotal lines.
- Don't smooth over contradictions or vagueness — note them. (A flagged contradiction is
  more useful than a falsely tidy summary.)
- If the transcript has NO speaker labels, infer from context who is the vendor (Twenty)
  and who is the prospect, and attribute accordingly. Names get garbled by speech-to-text —
  flag any uncertain name with "(uncertain)" and never invent a name.
- Keep PART A tight — it's the one-pager the deal/partner work runs on. Push everything not
  specific to this deal (product/website feedback, terminology, supporting quotes) to
  PART B. State each fact once; never repeat it across sections.

**Output (use these exact headers)**

```
== PART A — DEAL ONE-PAGER ==

1. ONE-LINE SUMMARY
2. COMPANY — name, what they do, size/employees, HQ + countries of operation, industry
3. PEOPLE ON THE CALL — name, role/title, side (Twenty vs prospect); infer roles if
   unlabeled and flag uncertain names
4. CURRENT SITUATION — what CRM/tools they use today; specific pains
5. WHY THEY'RE INTERESTED IN TWENTY
6. WHAT THEY WANT — bulleted needs/requirements, verbatim where possible
7. IMPLEMENTATION COMPLEXITY (for partner matching)
   - Deployment: cloud / self-host / both / unclear  (+ the evidence)
   - Data model: custom objects, multi-tenant, row-level security, migrations
   - Integrations / custom apps needed
   - Workflows / automation needs
   - Scale: number of seats/users
   - Region + language the partner would need to cover
8. COMMERCIALS — budget or prices discussed, plan tier (Pro/Org/Enterprise), seat count,
   deal value, who pays
9. TIMELINE & DECISION — key dates, decision-makers, urgency, decision process
10. OBJECTIONS / RISKS / FEARS — including anything that could kill the deal
11. ALTERNATIVES — competitors or other options they're weighing
12. DOES THIS DEAL NEED A PARTNER? — yes / no / maybe + why; and if yes, what kind
    (scope, region, language, seniority/tier)
13. NEXT STEPS / OPEN QUESTIONS / FOLLOW-UPS
14. PARTNER-FACING BRIEF — a 2-4 sentence narrative a partner can skim to decide yes/no,
    drawn only from PART A

== PART B — APPENDIX (not deal-specific) ==

15. PRODUCT / WEBSITE / GTM FEEDBACK — any feedback on the product, pricing page, website
    wording, onboarding, or trial; capture even if off-topic for qualification
16. TERMINOLOGY / DOMAIN-LANGUAGE NOTES — words used on the call that mean different things
    to each side or carry domain-specific meaning (e.g. "partner", "donor", jargon)
17. KEY VERBATIM QUOTES — 3-8 direct quotes that capture intent, needs, or objections
```

## Step 3 — Output and save

Print the brief in the conversation. Then offer to save it as Markdown — default to a
sibling of the source (e.g. next to the recording) or, for Twenty work, the
`partners-experience/research/` folder, named `YYYY-MM-DD-<company>-call-summary.md`. Don't
write the file unless the user wants it saved.

## How the fields map to the Partner model (for matching)

Section 7 + 12 are the matching axes: `Deployment → deploymentExpertise`, the scope needs →
`partnerScope`, `Region + language` → partner region/languages, scale → capacity, the
"needs a partner?" tier → `partnerTier`. Keeping these explicit is what lets the brief drop
straight into the opportunity→partner handover flow.

## Notes

- This is tuned for Twenty discovery calls, but the schema generalizes — swap the vendor
  framing in section 5/12 if reused elsewhere.
- The worked reference example lives at
  `partners-experience/research/2026-05-21-tsf-call-summary-final.md` (and the prompt alone
  at `partners-experience/research/call-summary-prompt.md`).
