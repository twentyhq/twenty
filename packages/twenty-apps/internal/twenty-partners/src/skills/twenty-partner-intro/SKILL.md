---
name: twenty-partner-intro
description: Send the partner introductions for a lead - record them in the CRM and open the ready-to-send emails in Chrome. Use once the user has reviewed a shortlist and named the partners they want to introduce, or whenever they say to make the intro, send the intros, connect the client with a partner, or generate the intro emails. Writes Application records in INVITED state, stamps introSentAt on the Opportunity, and opens each partner email as a prefilled Gmail draft. Chains after twenty-partner-shortlist.
trigger: /twenty-partner-intro
---

# twenty-partner-intro

Third and last step of the lead path.

```
twenty-lead-brief  →  twenty-partner-shortlist  →  twenty-partner-intro
```

Takes the partners the user picked and does two things: records the push in the CRM, and puts
ready-to-send emails on screen.

**This skill writes to production.** It creates Application records and stamps the
Opportunity. Read Phase 2 before running it on a lead you are unsure about.

Credentials, the `gql()` helper and every query live in `../_shared/partner-api.md`.

---

## Phase 0 — Inputs

Three things are needed. Ask for whatever is missing rather than guessing.

1. **The partners**, by name, as the user stated them. Never re-derive the list, and never
   add a partner they did not name. If they name someone who was not on the shortlist, take
   them: overriding the shortlist is the point of the review step.
2. **The lead folder**, for `partner-shortlist.md` and the brief. `twenty-partner-shortlist`
   names it at the end of its run.
3. **The Opportunity**, created by `twenty-lead-brief` at Step 6. Search by company name. If
   there is none, say so and ask whether to create one here or go back and run
   `/twenty-lead-brief`.

Read the Opportunity's `designDocUrl`. **Empty means stopping and asking for the Doc URL**:
the whole point of the link is that the partner emails carry it, and an intro without the
brief makes the partner ask for it in a round trip.

Resolve each partner's contact email from `persons` → `emails.primaryEmail`. No email on
record means saying so and leaving the `to` field blank rather than inventing an address.

---

## Phase 1 — Write to the CRM

Do this **before** the emails. If a write fails, the user finds out before anything leaves
their outbox.

For each confirmed partner:

1. **Check** `applications` filtered by `opportunityId` for an existing record for this
   partner. One already there means leaving it alone and reporting it: re-running must not
   create duplicates.
2. **Create** the Application: `{ opportunityId, partnerId, state: "INVITED" }`.

`INVITED` means Twenty pushed the partner at this lead. `APPLIED` means the partner came
forward on their own through the marketplace. Never write `APPLIED` here.

Then, once per run:

3. **Stamp** `introSentAt` on the Opportunity with the current timestamp. Already set means
   asking whether this is a second wave before overwriting it.

4. **Verify** by reading the Applications back, then print a line per partner: created, or
   already present.

---

## Phase 2 — The emails

For N confirmed partners, the total is `1 + 2N`.

### Rules, always applied

- **English by default.** Match another language only when the lead clearly operates in one,
  for instance a French lead. Tutoiement applies only in French.
- **Short.** 4 to 6 sentences, never more than a short screen. Cut throat-clearing, cut a
  recap the reader already has, cut anything the brief covers. A sentence doing no work goes.
- **Intros are launched in parallel, so frame them as already happening.** Never "may I
  introduce you" or "si c'est ok pour toi je te présente" or any other request for
  permission. State that the intros are going out.
- **No em dashes.** Use a colon or a comma.
- Sign: `Cheers,\nRashad\nPartnerships @twenty`
- Subject prefix: `[Twenty]`
- No self-introduction in a partner email: they know who Rashad is.
- **Link the brief, never attach it.** Put the `designDocUrl` in the body. A Gmail compose
  URL cannot carry a file, and the Doc reads better than a `.md` anyway.

### Email 1 — Client notification, one per run

A **reply inside the existing client thread**, not a new draft. Do not open a compose window
and do not invent a subject: a `view=cm` URL always starts a new thread. Output the body text
only, for the user to paste as a reply.

Content: the intros are going out, in parallel, to `<agency name(s)>`, who will reach out
directly. No permission-asking, no recap, no re-introduction.

### Email 2 per partner — Solo outreach

- **To**: the partner contact email
- **Subject**: `[Twenty] Partner opportunity: <Client>, <one-line project description>`
- **Content**: why this opportunity fits their profile, the project's complexity (custom
  objects, deployment, migration, seats), the brief link, an invitation to reply or take a
  call.

### Email 3 per partner — Three-way intro

- **To**: the partner contact email
- **CC**: the client email
- **Subject**: `[Twenty] <Client> x <Partner>: CRM project`
- **Content**: one sentence introducing each side, the project in two sentences, the brief
  link, then hand off.

### Opening them

Open **the partner emails only** (2 and 3), sequentially, 1.5 s apart. The helper is in the
shared reference. Email 1 is a thread reply, so it stays as text on screen.

---

## Phase 3 — Save and report

Save each email body to the lead folder:

- `email-1-client.txt`
- `email-2-<partner-slug>-solo.txt`
- `email-3-<partner-slug>-intro.txt`

Use the partner's `slug` field, not their display name. Older lead folders use ad-hoc names
(`email-4-intro-tatara.txt`, `email-fasttrack-codevelop.txt`); do not copy them.

Close with one table:

| Partner | Application | Emails opened |
|---|---|---|

Then the counts, and the reminder that Email 1 is the text to paste into the existing client
thread.
