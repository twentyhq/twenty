---
name: twenty-partner-match
description: Match a qualified lead to Twenty partners and generate all intro emails in one run. Use when a lead folder exists and you need to find the right implementation partner, either after running twenty-partner-design-doc or standalone when partner-match-criteria.md is already present. Chains back into twenty-lead-intro-call-summary and twenty-partner-design-doc if the criteria file is missing.
trigger: /twenty-partner-match
---

# twenty-partner-match

Match a qualified lead to Twenty partners and generate all intro emails in one run.

Chains after `twenty-lead-intro-call-summary` → `twenty-partner-design-doc`. Can be run standalone if `partner-match-criteria.md` already exists in the lead folder.

---

## Credentials

Before running, `~/.twenty/credentials.env` must exist with:

```env
TWENTY_PARTNERS_API_URL=https://partners.twenty.com
TWENTY_PARTNERS_API_KEY=<your key>

# Only needed if the input is a Fireflies link/ID
FIREFLIES_API_KEY=<your key>
```

The partners API key lives in `packages/twenty-apps/internal/twenty-partners/.env.prod` (gitignored) — copy it to `~/.twenty/credentials.env` on first setup. The skill reads `credentials.env` at startup and stops cleanly if a required key is missing.

---

## Phase 0 — Prerequisites

### 0a. Credentials check

Read `~/.twenty/credentials.env`. Verify `TWENTY_PARTNERS_API_URL` and `TWENTY_PARTNERS_API_KEY` are present. If not, stop and tell the user exactly which key is missing and where to add it.

### 0b. Brief check

Look for `partner-match-criteria.md` in the lead folder.

**If missing:** Ask the user what is available — a text transcript, a Fireflies meeting ID/URL, or an existing call summary or brief. Then chain:
- Fireflies input → fetch transcript via Fireflies API (requires `FIREFLIES_API_KEY`) → `/twenty-lead-intro-call-summary` → `/twenty-partner-design-doc`
- Text transcript → `/twenty-lead-intro-call-summary` → `/twenty-partner-design-doc`
- Existing summary → `/twenty-partner-design-doc`

`partner-match-criteria.md` is produced by `/twenty-partner-design-doc` as Step 8.

**If present — be critical before proceeding.** Read the file and assess quality:

- Are there at least 2 hard requirements with justification?
- Is the language requirement explicit?
- Are the required skills specific enough to differentiate partners (e.g. "self-hosted Docker" beats "technical")?
- Are there red flags listed?

If the brief is thin on any of these axes, say so and ask targeted follow-up questions before querying the API. A match built on a vague brief is noise. Only proceed once the criteria are solid enough to produce a meaningful ranking.

---

## Phase 1 — Matching

### 1a. Fetch candidates

Query the partners API:

```graphql
query ListPartners($after: String) {
  partners(
    filter: {
      validationStage: { eq: VALIDATED }
      availability: { eq: AVAILABLE }
    }
    after: $after
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id name slug languagesSpoken skills deploymentExpertise
        partnerScope partnerTier country region city introduction
        persons { edges { node { name { firstName lastName } emails { primaryEmail } } } }
        company { id name }
      }
    }
  }
}
```

Paginate until `pageInfo.hasNextPage` is false, passing `pageInfo.endCursor` as `$after` each iteration. Endpoint: `$TWENTY_PARTNERS_API_URL/graphql`.

### 1b. Evaluate and rank

Evaluate every candidate against the criteria in `partner-match-criteria.md`. Apply hard requirements as eliminators first (a partner missing a hard requirement does not appear in results, even with a note). Then rank remaining candidates by fit across:

- **Language** (primary) — exact match on `languagesSpoken`
- **Skills and expertise** (primary) — semantic match: "ERP experience" is relevant to complex billing, "self-hosted Docker" maps to `SELF_HOST` deploymentExpertise, etc.
- **Country / region** (secondary) — proximity helps but is not a blocker unless the criteria say otherwise

### 1c. Present results

Show **at minimum 2 candidates**, more if others score well. For each:

```
## [Partner name] — [fort / moyen / faible]

**Pourquoi ça matche**
- point 1
- point 2
- point 3

**Ce qui manque ou est risqué**
- point

**Contacts** : [name, email if available]
```

Be honest. If only one candidate is a strong match, say so and explain why the others are weaker — don't artificially inflate scores to fill a quota.

### 1d. Pause for validation

Ask the user which partners to introduce. They can pick one, several, or none (and ask to search differently). Wait for explicit confirmation before generating emails.

---

## Phase 2 — Emails

For each confirmed partner, generate three email types. For N confirmed partners, the total is `1 + 2N` emails.

### Email rules (always applied)

- **English by default.** Write all emails in English unless the lead clearly operates in another language (e.g. a French lead) — then match it. Tutoiement only applies when writing in French.
- **Keep it short.** Aim for 4-6 sentences, never more than a short screen. Cut throat-clearing, recaps the recipient already knows, and anything the attached brief covers. If a sentence isn't doing work, drop it.
- Intros are launched in parallel — frame them as already happening, not as a request for permission. Never write "may I introduce you" / "si c'est ok pour toi je te présente" or any permission-asking phrasing. State that the intro(s) are going out.
- No em dashes (`—`) — use `:` or `,` instead
- Sign: `Cheers,\nRashad\nPartnerships @twenty`
- Subject prefix: `[Twenty]`
- No self-introduction for partner emails (they know who Rashad is)
- Open in Gmail via `https://mail.google.com/mail/?view=cm&fs=1&to=...&su=...&body=...` using `open -a "Google Chrome"`

### Email 1 — Client notification (one per run)

This is a **reply to the existing client thread**, not a new draft. Don't open a Gmail compose for it and don't invent a subject — output the body text only so the user pastes it as a reply in the ongoing thread. No re-introduction (it's an existing conversation).

- **Content**: announce that the intro(s) are going out, in parallel, to [agency name(s)] who'll reach out directly. No permission-asking, no recap.

### Email 2 per partner — Solo partner outreach

- **To**: partner contact email (from `persons` → `emails.primaryEmail`; leave blank if none found)
- **Subject**: `[Twenty] Partner opportunity: [Client], [one-line project description]`
- **Content**: why this opportunity matches their profile, project complexity (custom objects, deployment, migration, seats), invite them to respond or get on a call, brief to attach

### Email 3 per partner — Three-way intro

- **To**: partner contact email
- **CC**: client email
- **Subject**: `[Twenty] [Client] x [Partner]: CRM project`
- **Content**: introduce client to partner (one sentence each), project in two sentences, brief to attach, hand off

### Opening in Gmail

Open the **partner emails only** (Email 2 and Email 3) as new Gmail drafts, sequentially with a 1.5s delay between each. Email 1 is a reply to the existing client thread — output its text for the user to paste, don't open a compose window. Use Python:

```python
import subprocess, urllib.parse, time, sys
params = {"view": "cm", "fs": "1", "to": to, "su": subject, "body": body}
if cc: params["cc"] = cc
url = "https://mail.google.com/mail/?" + urllib.parse.urlencode(params)
if sys.platform == "darwin":
    subprocess.run(["open", "-a", "Google Chrome", url])
else:
    # Linux / Windows: fall back to the system default browser
    import webbrowser
    webbrowser.open(url)
time.sleep(1.5)
```

Remind the user to attach `YYYY-MM-DD-<lead>-partner-brief.md` to all partner emails before sending.

---

## Output files

Save email content as text files in the lead folder for reference:

- `email-1-client.txt`
- `email-2-<partner-slug>-solo.txt`
- `email-3-<partner-slug>-intro.txt`

Use the partner's `slug` field for filenames.

---

## Chain context

This skill is the third step in the Twenty partner pipeline:

```
/twenty-lead-intro-call-summary → /twenty-partner-design-doc → /twenty-partner-match
```

The `partner-match-criteria.md` produced by `/twenty-partner-design-doc` (Step 8) is this skill's primary input. Keep the criteria file updated as you learn more about the lead — it feeds both this skill and the eventual in-product matching logic.
