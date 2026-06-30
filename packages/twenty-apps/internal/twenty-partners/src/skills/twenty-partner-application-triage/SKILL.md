---
name: twenty-partner-application-triage
description: Rank the partner-application backlog by net-new value and surface a short chase-list of high-value applicants who haven't booked a call. Use when the user wants to triage, rank, or prioritize partner applications, find which applicants are worth chasing, run the daily/weekly application review, or asks "who should I reach out to" / "which applications matter". Reads the live partners workspace; read-only.
trigger: /twenty-partner-application-triage
---

# twenty-partner-application-triage

Rank `APPLICATION`-stage partners by the value they would *add* — geographies and
languages we don't yet cover, plus proof of real Twenty work — and hand back a short
**chase-list**: the high-value applicants worth a personal nudge.

**The door stays open for everyone.** This skill does not reject or filter anyone out of
the pipeline. Booking a call is the motivation filter; this just makes sure the good
applicants who *didn't* book bubble up so they don't rot. The point is a few high-confidence
partners, not maximum coverage.

Read-only. It never mutates a record.

---

## Credentials

Needs `~/.twenty/credentials.env` (same file the other partner skills use):

```env
TWENTY_PARTNERS_API_URL=https://partners.twenty.com
TWENTY_PARTNERS_API_KEY=<your key>
```

The key lives in `packages/twenty-apps/internal/twenty-partners/.env.prod` (gitignored) —
copy it to `~/.twenty/credentials.env` on first setup.

---

## Phase 0 — Run the ranker

```bash
python3 "$(dirname "$0")/rank.py"          # or: python3 rank.py from the skill dir
```

`rank.py` is the deterministic core. It pulls every partner, computes each applicant's
net-new geo / language / scope / skills vs the **VALIDATED** baseline, detects a "real
Twenty work" proof signal in the notes, scores, and prints ranked JSON. It does not call an
LLM — the judgment lives in you (Phase 1).

Each ranked entry: `name, score, tier (A/B/C), new_geo, new_lang, new_scope, new_skills,
proof{workspace_url|customers|migration}, team, contact_name, email, linkedin, website,
notes`.

Scoring (in `rank.py`, tune there if it drifts): geo +3 each, language +3 each, scope +1,
skills +1 capped at 3 (so generic dev shops that spray skill lists can't dominate), proof
+6. Any proof signal ⇒ at least tier A.

**Booking state:** if the JSON has `booking_state_wired: false`, the `callBookedAt` field
isn't on the model yet, so the ranker scores **all** applications. Say so in the output.
Once `callBookedAt` exists, the ranker auto-narrows to the un-booked (the true chase set) —
no skill change needed.

If the run prints a missing-credentials error, stop and tell the user exactly which key to
add and where.

---

## Phase 1 — Judgment pass (this is the point)

The score surfaces; you decide. Read the `notes` of the **top ~15** plus anything tier-B/C
with a non-trivial note, and adjust:

- **Rescue the motivated-but-unobvious.** Someone whose checkboxes are thin but whose notes
  show real intent, a live Twenty instance, named customers, or a thoughtful pitch is a
  chase even at a low score. This is the whole reason a human/LLM reads the notes — the
  applicants who do things we don't see in the form are exactly who we don't want to lose.
- **Sanity-check volume inflation.** A high score driven by 6 net-new *languages* from one
  solo, or a long skills list, may be aspirational. Confirm it against the notes before
  ranking it top. Real net-new geography with proof beats a long list every time.
- **Demote noise.** Empty notes, agency spam, or "Tally submission: <id>" with nothing else
  is tier C regardless of score. Don't chase them.
- **Note proof quality.** `workspace_url` + `customers` together (a live workspace with named
  clients) is the strongest signal — stronger than the raw score. Call it out.

Don't invent facts. If a note is ambiguous, say so rather than upgrading on a guess.

---

## Phase 2 — Output the chase-list

A tight digest, grouped by tier, A first. Lead with the count and the booking-state caveat.

```
# Partner application triage — N applications ranked (booking state: not wired / un-booked only)

## Chase now (Tier A — fills a gap AND/OR proven)
- **<name>** (<team>) — +<geo>/<lang>; proof: <workspace+customers/…>
  why: <one line, drawn from notes>
  reach: <email> · <linkedin>

## Worth a look (Tier B)
- <name> — <one line>; reach: <email>

## Skip for now (Tier C) — <count>, not listed (empty/spam/no gap)
```

Rules:
- Tier A is the actual worklist. Keep it short — if it's 18 long, the proof-backed gap-fillers
  go first and the volume-only ones go last.
- Always give a reach handle (email from `contact_name`/`email`, else linkedin, else website).
  If none, say "no contact on record" — that itself is a data-quality flag.
- Be honest. If only a handful are genuinely worth chasing, say so; don't pad the A-tier.

---

## What this is not

- Not a gate. It never moves anyone to `REJECTED` or out of the funnel.
- Not a writer. It never edits a record. Surfacing only.
- Not the production cron. This is the **dev surface** for the ranking. Once the chase-list
  is trustworthy, the deterministic core (`rank.py`) is what gets ported to a daily
  logic-function cron in the partner app that writes `ranking` + a tier onto each un-booked
  record so the workspace view sorts itself. The LLM judgment pass stays here, for the runs
  where you want a human in the loop. Build skill → trust it → port the cheap part. Don't
  build both.

## Self-check

`python3 rank.py --selftest` asserts the scoring orders a gap-filler-with-proof above a
skill-sprayer above an empty record, and that skill volume stays capped. Run it after any
edit to the weights or signal regexes.
