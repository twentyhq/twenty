---
name: twenty-lead-brief
description: Turn a Twenty sales/discovery call into a partner-ready brief and record the lead in the CRM. Use whenever the user has a call recording, transcript, Fireflies link, or a lead folder and wants to qualify the deal, summarize the call, write a partner brief, or prep the partner handoff. Trigger even without the word "brief" - "summarize this call", "what did we learn from the X call", "qualify this lead", "scope this for a partner", "draft a design doc", or pointing at a transcript file all count. Produces a qualification summary, a partner brief, matching criteria, and an Opportunity in the partners workspace. Pass --full for inference mode.
trigger: /twenty-lead-brief
---

# twenty-lead-brief

First step of the lead path. Takes a raw call and produces everything the rest of the path
needs:

```
twenty-lead-brief  →  twenty-partner-shortlist  →  twenty-partner-intro
```

Four outputs, in order:

1. A **qualification summary** printed in the conversation. You can stop here.
2. A **partner brief** the partner reads to scope and quote.
3. **`partner-match-criteria.md`**, the input to `twenty-partner-shortlist`.
4. An **Opportunity** in the partners workspace, carrying the brief's URL.

Credentials, the `gql()` helper and every query live in `../_shared/partner-api.md`. Read it
rather than restating anything.

---

## Step 1 — Get the transcript

The user provides it: pasted text, a path (`.txt` / `.vtt` / `.srt`, a meetily folder or
`transcripts.json`), or a Fireflies link or ID.

- meetily `transcripts.json` is `{ "segments": [ { "text": … } ] }`: concatenate `text` in
  order.
- `.vtt` / `.srt`: drop cue numbers and timecodes.
- Fireflies: fetch the transcript detail (see the shared reference). Needs `FIREFLIES_API_KEY`.

**No transcript means stop and ask.** Never fabricate one, never proceed without one.

For a long transcript, read the whole thing before writing. Coverage is the point.

---

## Step 2 — The qualification summary

A **structured extraction against a fixed schema**, not a summary. A "summary that loses
nothing" is a contradiction; the schema is what prevents loss, because every dimension has a
slot and a gap is marked rather than silently dropped.

**Rules**

- Extract ONLY what is in the transcript. If a field isn't covered, write "Not discussed."
  A visible gap beats a confident fabrication: it is the signal to ask on the next call.
- Separate stated FACTS from your INFERENCES. Mark any inference "(inferred)". Downstream
  matching trusts the facts, so don't contaminate them with guesses.
- Preserve specifics verbatim: numbers, dates, names and roles, tool and CRM names, prices,
  budgets, exact requirements. Never round or paraphrase a number. Specifics are where the
  matching signal lives.
- Use the customer's own words for needs and objections. Quote pivotal lines.
- Don't smooth over a contradiction or a vagueness: note it. A flagged contradiction is more
  useful than a falsely tidy summary.
- With no speaker labels, infer from context who is Twenty and who is the prospect.
  Speech-to-text garbles names: flag an uncertain one "(uncertain)" and never invent one.
- Keep PART A tight: it is the one-pager the rest of the path runs on. Push anything not
  specific to this deal into PART B. State each fact once.

**Output (these exact headers)**

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

15. PRODUCT / WEBSITE / GTM FEEDBACK — feedback on the product, pricing page, website
    wording, onboarding, or trial; capture even if off-topic for qualification
16. TERMINOLOGY / DOMAIN-LANGUAGE NOTES — words that mean different things to each side or
    carry domain-specific meaning (e.g. "partner", "donor", jargon)
17. KEY VERBATIM QUOTES — 3-8 direct quotes that capture intent, needs, or objections
```

Print it, then save it to the lead folder as `YYYY-MM-DD-<lead>-call-summary.md`.

**Stop here if the user only wanted the summary.** Ask before continuing to Step 3: a lead
that is clearly not partner-shaped (section 12 says no) does not need a partner brief.

---

## Step 3 — The partner brief

**The doctrine lives in `design-doc-doctrine.md` in this folder: what to produce, the
structure, the rules, the verification, the self-check. Read it and follow it.** The rest of
this section is only the mechanics.

Default output is a **zero-inference partner brief**. Pass `--full` for the inference-enabled
design doc. The doctrine defines both.

1. **Gather** — read every source material in full, not just the summary. Convert a `.docx`
   with `textutil -convert txt "<file>" -output /tmp/out.txt` on macOS.
2. **Extract, grounded** — facts vs inferences, per the doctrine.
3. **Draft** in the doctrine's section structure.
4. **Verify load-bearing claims live** — WebFetch against the doctrine's doc map before
   asserting any capability. Build the References appendix as you go.
5. **Reconcile discrepancies** — sources that disagree (call vs braindump, a name differing
   across sources) get flagged both ways, never silently resolved.
6. **Resolve ❓ with the operator** — after a full v1 draft, use AskUserQuestion for the
   unknowns a Twenty insider can answer. Leave customer-facing unknowns as ❓. **Running
   autonomously** (a subagent or batch run) means skipping the questions and leaving every
   unknown as ❓.
7. **Run the doctrine's self-check**, fix, then save as `YYYY-MM-DD-<lead>-partner-brief.md`
   (or `-design-doc.md` in `--full`).

---

## Step 4 — Publish the brief as a Google Doc

The partner gets a link, never an attachment: a Gmail compose URL cannot carry a file, and a
`.md` attachment is a poor read.

1. Open the shared Drive folder in Chrome:

```bash
open -a "Google Chrome" "https://drive.google.com/drive/folders/1ISDCplqLv6GrBQOOX7Fk4OK07LAK8BPd"
```

2. Tell the user: create the Doc there, paste the brief markdown, then paste the share URL
   back. Mention `Tools → Preferences → Enable Markdown` once, so the paste renders headings,
   bold and tables instead of showing raw `##`.

3. **Wait for the URL.** If the user skips it, carry on with Step 5 and leave `designDocUrl`
   empty. Say so, because `twenty-partner-intro` will then have no link to send.

The folder is shared `anyone with the link can view`, so a partner can open it without an
account. Do not call the Drive API: the connected account is personal, and any Doc it created
would land in the wrong Drive under the wrong owner.

---

## Step 5 — Write `partner-match-criteria.md`

Always, as a third file in the lead folder. This is the input `twenty-partner-shortlist`
reads.

- **Hard requirements** — a `Criterion | Why` table. Cover language and region, deployment
  type, data-model complexity signal, migration capability, engagement model (fixed vs
  retainer).
- **Strong preference** — bullets: domain familiarity, migration experience, willingness to
  scope for free, ability to work with non-technical end-users.
- **Nice to have** — bullets: industry-specific workflow experience, partner size fit.
- **Red flags** — bullets: anything that would disqualify a partner silently (language,
  hosting model, engagement type, technical depth).
- **Budget** — what the client said about money, verbatim, or "not stated". Most calls never
  state a ceiling, and that is itself the answer. `twenty-partner-shortlist` shows this next
  to each partner's rate; it never filters on it.
- **Matching notes** — 3 to 5 bullets: technical nuances, the prospect's sophistication
  level, migration unknowns, who the decision-makers are. Draw from Open questions and
  Implementation complexity.

---

## Step 6 — Record the Opportunity

**This step writes to production.** Search before creating, always.

1. **Search** for an existing Opportunity on the company name (see the shared reference). If
   one comes back, show it to the user and ask whether to update it or create a new one.
   Never create a silent duplicate.
2. **Resolve the company and the point of contact**: search first, create only on a miss.
3. **Create** the Opportunity:

| Field | Value |
|---|---|
| `name` | `<Company> <need in about three words>`, matching existing records: `TADA new CRM`, `Aranya CRM Migration`, `ECF PRO - Self-hosting multi-workspace` |
| `stage` | `NEW` |
| `need` | one line, from section 6 of the summary |
| `requirements` | the requirements text, from section 7 |
| `companyId`, `pointOfContactId` | resolved above |
| `designDocUrl` | `{ "primaryLinkUrl": "<the Doc URL>", "primaryLinkLabel": "Partner brief" }`, omitted if Step 4 produced no URL |

Do **not** set `isListed`: that belongs to the marketplace pull flow, which this path does
not use. Do **not** set `introSentAt` and do not create any Application:
`twenty-partner-intro` owns both.

4. **Verify** by reading the record back, then print its id and name.

---

## Output files

In the lead folder:

- `YYYY-MM-DD-<lead>-call-summary.md`
- `YYYY-MM-DD-<lead>-partner-brief.md` (or `-design-doc.md` in `--full`)
- `partner-match-criteria.md`

---

## Notes

- Keep `partner-match-criteria.md` current as you learn more about the lead. It feeds
  `twenty-partner-shortlist` and, eventually, in-product matching logic.
- Sections 7 and 12 of the summary are the matching axes: `Deployment → deploymentExpertise`,
  scope needs → `partnerScope`, region and language → partner region and languages, scale →
  capacity, the "needs a partner?" tier → `partnerTier`.
- Worked example: `partners-experience/TSF/2026-05-26-tsf-design-doc.md` shows the target
  coverage, flag discipline and verification appendix. It predates the current concision and
  formatting rules, so **follow the doctrine over the example** where they differ.
