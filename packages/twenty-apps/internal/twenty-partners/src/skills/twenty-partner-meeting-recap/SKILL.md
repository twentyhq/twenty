---
name: twenty-partner-meeting-recap
description: Pull recent Fireflies partner meetings, match each to an existing Partner record by attendee email/domain, write a recap (transcript-first, Fireflies summary as fallback), and inject it as a Note on the partner's profile. Use after a batch of partner calls when you want each partner's CRM record updated with what was said. Read-only for leads/discovery calls (they have no Partner match and are skipped).
trigger: /twenty-partner-meeting-recap
---

# twenty-partner-meeting-recap

After partner calls: pull the Fireflies meetings, figure out which partner each one is (by matching an attendee to an existing Partner record), summarize the call, and drop that summary as a Note on the partner's profile. Runs end to end with no per-note confirmation.

Sibling of `twenty-partner-match`. This one is about **existing partners** (recap their calls), not about matching a lead to partners.

Optional `--prune`: after recaps are safely in the CRM, delete the corresponding Fireflies recordings to free storage (confirmed first — see Phase 6).

---

## Credentials

Reads `~/.twenty/credentials.env`:

```env
TWENTY_PARTNERS_API_URL=https://partners.twenty.com
TWENTY_PARTNERS_API_KEY=<your key>
FIREFLIES_API_KEY=<your key>
```

All three are required. The partners key lives in `packages/twenty-apps/internal/twenty-partners/.env.prod` (gitignored); the Fireflies key is your personal API key. Stop cleanly and name the missing key if any is absent.

---

## Phase 0 — Prerequisites

Read `~/.twenty/credentials.env`. Verify `TWENTY_PARTNERS_API_URL`, `TWENTY_PARTNERS_API_KEY`, `FIREFLIES_API_KEY` are all present. If one is missing, stop and tell the user exactly which key to add and where.

---

## Phase 1 — Pull meetings

Default scope: **meetings from the last 2 days** (covers "yesterday"). The user can override per run — "last week", a date, or by pasting specific Fireflies URLs/IDs (the ID is the trailing `01K...` segment of `app.fireflies.ai/view/<slug>::<ID>`).

List recent transcripts, then keep only those inside the scope window (Fireflies `date` is epoch milliseconds). For each kept transcript, fetch its detail (attendees + summary + sentences). See **Reference queries** for the exact GraphQL. Add a `User-Agent` header to every Fireflies request — the API rejects the default urllib agent.

`transcripts(limit:)` is **capped at 50** by Fireflies — a higher value is a hard `invalid_arguments` 400, not a soft clamp. Use 50 and page if you ever need more.

If two transcripts share the same partner and day (Fireflies sometimes double-records), keep the one with more sentences.

---

## Phase 2 — Match each meeting to a Partner

Only meetings tied to an existing Partner get processed. Leads/discovery calls (no Partner match) are skipped and listed at the end.

1. Page through all partners once, pulling each partner's linked person emails and company domain (see Reference queries). Build two maps:
   - `email -> partner` from every `persons.edges.node.emails.primaryEmail`
   - `domain -> [partners]` from each partner's `company.domainName.primaryLinkUrl`
2. For each meeting, take the attendee emails, drop anything `@twenty.com` and the host/organizer (that's the Twenty side). For each remaining attendee email:
   - **Exact email match** against `email -> partner` wins (strongest signal).
   - Else **domain match** against `domain -> [partners]`, skipping free providers (`gmail.com`, `outlook.com`, `hotmail.com`, `yahoo.com`, `icloud.com`, `proton.me`, etc.). If exactly one partner shares the domain, match it. If several do, **flag in the report and skip** rather than guess.
3. The meeting title is a secondary hint only (`Partner intro between … and <name>` was the historical convention) — never the primary matcher.

A meeting with no Partner match is a lead/other call: skip it, record it under "skipped" with the reason.

---

## Phase 3 — Summarize (transcript first)

For each matched meeting, pick the better source. **Judge content quality first — never write a note from nothing or from noise:**

- A transcript is **usable** only if it has real content: roughly `>= 15` sentences **and** an average of `>= 4` words per sentence. A handful of one-word lines (`Platform.` `Opportunity.` `Background.`) is garbled ASR, not a transcript — treat it as unusable even though the array is non-empty.
- **Usable transcript** → write the recap yourself from the transcript. This is the default whenever a usable transcript exists.
- **No usable transcript, but a Fireflies summary exists** → fall back to `summary.overview` (try richer fields, then `short_summary`). Note the fallback in the source line.
- **Neither** (no usable transcript AND empty summary) → the call is **still processing or unrecorded**. Skip it, record it under "skipped: content not ready", and move on. Today's calls often land here for a while after they end. Never inject an empty or placeholder note.

Write the note in English, structured (the format validated previously). No em dashes — use `:` or `,`.

```
**TL;DR:** one-line verdict / state of the relationship.

**Profil:** team size, location, languages, structure.
**Compétences Twenty:** deployment (cloud / self-host), data model, migrations, what they've actually shipped.
**Contexte:** background, how they found Twenty, motivation, target clients, current partnerships.
**Next steps:** concrete follow-ups (who owes what).
**Flags:** risks, unknowns, ASR artifacts to double-check.

Source: Fireflies <transcript-id> (call <YYYY-MM-DD>, transcript|summary).
```

The `Source: Fireflies <transcript-id>` line is load-bearing: it is the dedup key for re-runs. Always include the real transcript id.

---

## Phase 4 — Inject the Note (automatic)

For each matched meeting, before writing, check whether this meeting was already noted:

- Read the partner's existing notes (noteTargets filtered by `targetPartnerId`). Look for a note whose body contains `Fireflies <transcript-id>`.
- **No such note** → create one: `createNote` with `bodyV2.markdown`, then `createNoteTarget` linking `noteId` to `targetPartnerId`. Title: `Partner call recap: <Partner name> (<YYYY-MM-DD>)`.
- **Note already exists** → regenerate the recap, diff it against the existing body, and **append only net-new information** under a dated `**Update <YYYY-MM-DD>:**` block via `updateNote` (`bodyV2.markdown` = existing body + the new block). If nothing is new, leave it untouched.

No confirmation step — match, summarize, write. Then verify each write by reading the note back and confirming the partner link resolved.

---

## Phase 5 — Report

Print one table:

| Meeting (date · title) | Attendee matched | Partner | Action |
|---|---|---|---|

`Action` is one of: `created`, `updated (appended)`, `unchanged`, `skipped: no partner match`, `skipped: ambiguous domain (N partners)`, `skipped: content not ready`. End with counts (`created / updated / unchanged / skipped`).

---

## Phase 6 — Prune (`--prune`, opt-in, deletes Fireflies recordings)

Runs only when invoked with `--prune` (Fireflies storage fills up; recordings whose content is already safe in the CRM are dead weight). **Deletion is irreversible and on an external service — always confirm before deleting.**

A recording is **safe to prune** only when its recap note is confirmed written this run (`created` or `updated`) **or** already exists in the CRM with this transcript's `Fireflies <id>` in its body. Never prune a meeting that was skipped, has no note, or whose note you could not verify — losing the recording would lose the only copy.

1. Build the prune set from this run's safe meetings (plus, if asked to "free more", existing recap notes whose `Fireflies <id>` you can resolve to a still-present transcript).
2. **Present the exact list** (partner, transcript id, date) and get explicit confirmation. Default to keeping the most recent unless told otherwise.
3. Delete each confirmed transcript with `deleteTranscript(id:)`, then **verify** by re-listing and confirming the ids are absent. Report `deleted N/M` and how many transcripts remain.

Matching old notes back to transcripts: yesterday's notes embed only a date, not the id, so fall back to the meeting-title person name (`Partner intro between … and <name>` / `… - <name> x Rashad`) against the partner name in the note title. New notes written by this skill carry `Fireflies <id>` in the body, so the mapping is exact going forward.

---

## Reference queries

All partner calls go to `$TWENTY_PARTNERS_API_URL/graphql` with `Authorization: Bearer $TWENTY_PARTNERS_API_KEY`. All Fireflies calls go to `https://api.fireflies.ai/graphql` with `Authorization: Bearer $FIREFLIES_API_KEY` **and** a browser `User-Agent`. Helper:

```python
import os, json, urllib.request
creds = {}
for line in open(os.path.expanduser("~/.twenty/credentials.env")):
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1); creds[k] = v.strip()

def gql(url, key, query, variables=None):
    body = json.dumps({"query": query, "variables": variables or {}}).encode()
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key,
        "User-Agent": "Mozilla/5.0"})
    return json.load(urllib.request.urlopen(req, timeout=90))
```

**Fireflies — list recent transcripts** (`date` is epoch ms; `limit` max 50):
```graphql
query{ transcripts(limit:50){ id title date duration participants meeting_attendees{ displayName email } } }
```

**Fireflies — delete a recording (`--prune` only):**
```graphql
mutation($id:String!){ deleteTranscript(id:$id){ id title } }
```

**Fireflies — one transcript's detail:**
```graphql
query($id:String!){ transcript(id:$id){
  title date duration participants host_email organizer_email
  meeting_attendees{ displayName email }
  summary{ overview short_summary keywords }
  sentences{ speaker_name text } } }
```

**Partners — page through all with person emails + company domain:**
```graphql
query($a:String){ partners(after:$a){
  pageInfo{ hasNextPage endCursor }
  edges{ node{
    id name slug validationStage
    persons{ edges{ node{ name{ firstName lastName } emails{ primaryEmail } } } }
    company{ name domainName{ primaryLinkUrl } } } } } }
```
Paginate until `pageInfo.hasNextPage` is false, passing `endCursor` as `$a`.

**Partner — existing notes (dedup check):**
```graphql
query($pid:UUID!){ noteTargets(filter:{ targetPartnerId:{ eq:$pid } }){
  edges{ node{ note{ id title bodyV2{ markdown } createdAt } } } } }
```

**Write a note and link it to the partner:**
```graphql
mutation($d:NoteCreateInput!){ createNote(data:$d){ id title } }
# variables: { "d": { "title": "...", "bodyV2": { "markdown": "..." } } }

mutation($d:NoteTargetCreateInput!){ createNoteTarget(data:$d){ id targetPartnerId } }
# variables: { "d": { "noteId": "<note id>", "targetPartnerId": "<partner id>" } }
```

**Append to an existing note (re-run path):**
```graphql
mutation($id:UUID!,$d:NoteUpdateInput!){ updateNote(id:$id,data:$d){ id } }
# variables: { "id": "<note id>", "d": { "bodyV2": { "markdown": "<existing + new block>" } } }
```

**Verify a write:**
```graphql
query($id:UUID!){ note(filter:{ id:{ eq:$id } }){
  id title noteTargets{ edges{ node{ targetPartnerId targetPartner{ name } } } } } }
```
