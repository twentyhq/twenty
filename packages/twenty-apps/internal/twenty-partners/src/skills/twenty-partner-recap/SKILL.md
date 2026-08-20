---
name: twenty-partner-recap
description: Pull recent Fireflies partner meetings, match each to an existing Partner record by attendee email or domain, write a recap (transcript-first, Fireflies summary as fallback), and inject it as a Note on the partner's profile. Use after a batch of partner calls when you want each partner's CRM record updated with what was said. Leads and discovery calls have no Partner match and are skipped. Pass --prune to delete the Fireflies recordings once the recaps are safely in the CRM.
trigger: /twenty-partner-recap
---

# twenty-partner-recap

Network upkeep, not the lead path. After a batch of partner calls: pull the Fireflies
meetings, work out which partner each one is, summarize the call, and drop that summary as a
Note on the partner's profile. Runs end to end with no per-note confirmation.

The recap notes it writes are what `twenty-partner-shortlist` later reads to tell a real
capability from a partner's own marketing copy. Roughly 5 of the 29 validated partners have
one today, so every run makes the shortlist better.

Optional `--prune`: after the recaps are safely in the CRM, delete the corresponding Fireflies
recordings to free storage. Confirmed first, see Phase 6.

Credentials, the `gql()` helper and every query live in `../_shared/partner-api.md`. This
skill needs all three keys.

---

## Phase 1 — Pull meetings

Default scope: **the last 2 days**, which covers "yesterday". The user can override per run:
"last week", a date, or pasted Fireflies URLs and IDs.

List recent transcripts, keep the ones inside the window (`date` is epoch milliseconds), then
fetch each kept transcript's detail.

If two transcripts share the same partner and day (Fireflies sometimes double-records), keep
the one with more sentences.

---

## Phase 2 — Match each meeting to a Partner

Only a meeting tied to an existing Partner gets processed. A lead or discovery call has no
Partner match: skip it and list it at the end.

1. Page through all partners once, building two maps:
   - `email → partner` from every `persons.edges.node.emails.primaryEmail`
   - `domain → [partners]` from each `company.domainName.primaryLinkUrl`
2. For each meeting, take the attendee emails and drop anything `@twenty.com` plus the host
   and organizer: that is the Twenty side. For each remaining attendee:
   - **Exact email match** wins. It is the strongest signal.
   - Otherwise **domain match**, skipping free providers (`gmail.com`, `outlook.com`,
     `hotmail.com`, `yahoo.com`, `icloud.com`, `proton.me` and friends). Exactly one partner
     on the domain means a match. Several means **flag it in the report and skip**, never
     guess.
3. The meeting title is a secondary hint only (`Partner intro between … and <name>` was the
   historical convention). Never the primary matcher.

---

## Phase 3 — Summarize, transcript first

Judge content quality before writing. **Never write a note from nothing or from noise.**

- A transcript is **usable** only with real content: roughly 15 sentences or more **and** an
  average of 4 words or more per sentence. A handful of one-word lines (`Platform.`
  `Opportunity.` `Background.`) is garbled ASR, not a transcript. Treat it as unusable even
  though the array is not empty.
- **Usable transcript** → write the recap yourself from the transcript. The default whenever
  one exists.
- **No usable transcript but a Fireflies summary exists** → fall back to `summary.overview`,
  then richer fields, then `short_summary`. Note the fallback in the source line.
- **Neither** → the call is still processing or was never recorded. Skip it, record it as
  "skipped: content not ready", move on. Today's calls often land here for a while. Never
  inject an empty or placeholder note.

Write the note in English, structured. No em dashes: use a colon or a comma.

```
**TL;DR:** one-line verdict / state of the relationship.

**Profil:** team size, location, languages, structure.
**Compétences Twenty:** deployment (cloud / self-host), data model, migrations, what they've
actually shipped.
**Contexte:** background, how they found Twenty, motivation, target clients, current
partnerships.
**Next steps:** concrete follow-ups (who owes what).
**Flags:** risks, unknowns, ASR artifacts to double-check.

Source: Fireflies <transcript-id> (call <YYYY-MM-DD>, transcript|summary).
```

The `Source: Fireflies <transcript-id>` line is load-bearing: it is the dedup key for re-runs
and the prune key for Phase 6. Always include the real transcript id.

**Compétences Twenty is the section that matters downstream.** It is the only place a
verified capability gets recorded, as opposed to what the partner writes about themselves.
State what they have actually shipped, not what they say they can do.

---

## Phase 4 — Inject the Note

For each matched meeting, check first whether it was already noted: read the partner's notes
(`noteTargets` filtered by `targetPartnerId`) and look for a body containing
`Fireflies <transcript-id>`.

- **No such note** → `createNote` with `bodyV2.markdown`, then `createNoteTarget` linking
  `noteId` to `targetPartnerId`. Title: `Partner call recap: <Partner name> (<YYYY-MM-DD>)`.
- **Note exists** → regenerate the recap, diff it against the existing body, and append
  **only net-new information** under a dated `**Update <YYYY-MM-DD>:**` block via
  `updateNote`. Nothing new means leaving it untouched.

No confirmation step: match, summarize, write. Then verify each write by reading the note back
and confirming the partner link resolved.

---

## Phase 5 — Report

One table:

| Meeting (date · title) | Attendee matched | Partner | Action |
|---|---|---|---|

`Action` is one of `created`, `updated (appended)`, `unchanged`, `skipped: no partner match`,
`skipped: ambiguous domain (N partners)`, `skipped: content not ready`. End with the counts.

---

## Phase 6 — Prune (`--prune`, opt-in, deletes Fireflies recordings)

Runs only with `--prune`. Fireflies storage fills up, and a recording whose content is
already safe in the CRM is dead weight. **Deletion is irreversible and on an external
service, so always confirm before deleting.**

A recording is **safe to prune** only when its recap note was confirmed written this run
(`created` or `updated`), **or** already exists in the CRM with this transcript's
`Fireflies <id>` in its body. Never prune a meeting that was skipped, has no note, or whose
note you could not verify: losing the recording loses the only copy.

1. Build the prune set from this run's safe meetings. If asked to "free more", add existing
   recap notes whose `Fireflies <id>` resolves to a still-present transcript.
2. **Present the exact list** (partner, transcript id, date) and get explicit confirmation.
   Default to keeping the most recent unless told otherwise.
3. Delete each confirmed transcript with `deleteTranscript(id:)`, then **verify** by
   re-listing and confirming the ids are gone. Report `deleted N/M` and how many remain.

Matching old notes back to transcripts: notes written before this skill embed only a date, not
an id, so fall back to the meeting-title person name (`Partner intro between … and <name>`,
`… - <name> x Rashad`) against the partner name in the note title. Notes written by this skill
carry `Fireflies <id>` in the body, so the mapping is exact going forward.
