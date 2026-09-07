---
name: twenty-partner-triage
description: Rank the partner-application backlog by net-new value and hand back a short chase-list of applicants worth a personal nudge. Use when the user wants to triage, rank, or prioritize partner applications, find which applicants are worth chasing, run the daily or weekly application review, or asks "who should I reach out to" / "which applications matter". Reads the live partners workspace, read-only, never mutates a record.
trigger: /twenty-partner-triage
---

# twenty-partner-triage

Network upkeep, not the lead path. Rank `APPLICATION`-stage partners by the value they would
*add* (geographies and languages the roster doesn't yet cover, plus proof of real Twenty work)
and hand back a short **chase-list**: the applicants worth a personal nudge.

**The door stays open for everyone.** This skill rejects nobody and filters nobody out of the
pipeline. It just makes sure the good applicants bubble up so they don't rot. The point is a
few high-confidence partners, not maximum coverage.

Read-only. It never mutates a record.

Credentials live in `../_shared/partner-api.md`. This skill needs the partners URL and key.

---

## Phase 0 — Run the ranker

```bash
python3 "$(dirname "$0")/rank.py"          # or: python3 rank.py from the skill dir
```

`rank.py` is the deterministic core. It pulls every partner, computes each applicant's
net-new geo, language, scope and skills against the **VALIDATED** baseline, detects a "real
Twenty work" proof signal in the notes, scores, and prints ranked JSON. It calls no LLM: the
judgment lives in you, at Phase 1.

Each ranked entry: `name, score, tier (A/B/C), new_geo, new_lang, new_scope, new_skills,
proof{workspace_url|customers|migration}, team, contact_name, email, linkedin, website,
notes`.

Scoring, tunable in `rank.py`: geo +3 each, language +3 each, scope +1, skills +1 capped at 3
(so a dev shop spraying skill lists can't dominate), proof +6. Any proof signal means at least
tier A.

**Scope: every application is scored.** There is no booking signal on the Partner object, so
the ranker cannot narrow to the applicants who never booked a call. That is the true chase
set, and reaching it would mean adding a field and populating it from the calendar. Until
someone does, say plainly in the output that the list covers all applications, booked or not.

A missing-credentials error means stopping and naming the key to add.

---

## Phase 1 — Judgment pass (this is the point)

The score surfaces; you decide. Read the `notes` of the **top ~15**, plus anything tier-B or
tier-C with a non-trivial note, and adjust:

- **Rescue the motivated-but-unobvious.** Thin checkboxes but notes showing real intent, a
  live Twenty instance, named customers, or a thoughtful pitch is a chase even at a low
  score. This is the whole reason a human reads the notes: the applicants who do things the
  form doesn't capture are exactly the ones not to lose.
- **Sanity-check volume inflation.** A high score driven by 6 net-new *languages* from one
  solo, or a long skills list, may be aspirational. Confirm against the notes before ranking
  it top. Real net-new geography with proof beats a long list every time.
- **Demote noise.** Empty notes, agency spam, or `Tally submission: <id>` with nothing else is
  tier C regardless of score. Don't chase them.
- **Note proof quality.** `workspace_url` and `customers` together, a live workspace with
  named clients, is the strongest signal, stronger than the raw score. Call it out.

Don't invent facts. An ambiguous note gets said so, not upgraded on a guess.

---

## Phase 2 — Output the chase-list

A tight digest, grouped by tier, A first. Lead with the count and the scope caveat.

```
# Partner application triage — N applications ranked (all applications, no booking signal on the model)

## Chase now (Tier A — fills a gap AND/OR proven)
- **<name>** (<team>) — +<geo>/<lang>; proof: <workspace+customers/…>
  why: <one line, drawn from notes>
  reach: <email> · <linkedin>

## Worth a look (Tier B)
- <name> — <one line>; reach: <email>

## Skip for now (Tier C) — <count>, not listed (empty/spam/no gap)
```

Rules:

- Tier A is the actual worklist. Keep it short. Eighteen entries means the proof-backed
  gap-fillers go first and the volume-only ones go last.
- Always give a reach handle: email from `contact_name` or `email`, else linkedin, else
  website. None on record means saying "no contact on record", which is itself a data-quality
  flag.
- Be honest. A handful genuinely worth chasing is a real answer. Don't pad the A-tier.

---

## What this is not

- **Not a gate.** It never moves anyone to `REJECTED` or out of the funnel.
- **Not a writer.** It never edits a record. Surfacing only.
- **Not a background job.** Nothing here is scheduled. The judgment pass stays here, for
  the runs where a human is in the loop.

## Self-check

`python3 rank.py --selftest` asserts that the scoring orders a gap-filler-with-proof above a
skill-sprayer above an empty record, and that skill volume stays capped. Run it after any edit
to the weights or the signal regexes.
