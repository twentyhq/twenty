---
name: twenty-partner-shortlist
description: Shortlist the Twenty partners who fit a lead, with the reason for each, and stop so the user can review. Use when the user asks who to introduce, who fits this deal, which partners to consider, or to match a lead to partners. Works from a lead folder's partner-match-criteria.md, or straight from an Opportunity's need and requirements for a website form submission that has no call behind it. Read-only - it never writes to the CRM and never writes emails. Chains forward into twenty-partner-intro once the user has picked.
trigger: /twenty-partner-shortlist
---

# twenty-partner-shortlist

Second step of the lead path.

```
twenty-lead-brief  →  twenty-partner-shortlist  →  twenty-partner-intro
```

Produce a shortlist of partners who fit this lead, each with the reason, and **stop**. The
user reviews it, adds, removes and changes it, then runs `twenty-partner-intro` with the
names they settled on.

**This skill is read-only and email-free.** It never writes to the CRM. It never drafts,
opens or sends an email. Those belong to `twenty-partner-intro`. That separation is the whole
point: a stop instruction sitting above email instructions in the same file gets walked past,
so the barrier is the end of this skill.

Credentials, the `gql()` helper and the partner query live in `../_shared/partner-api.md`.

---

## Phase 0 — Inputs

Criteria come from one of two places. Check them in this order.

**1. `partner-match-criteria.md` in the lead folder.** The richer source, produced by
`/twenty-lead-brief` at Step 5. Use it whenever it exists.

**2. The Opportunity's own `need` and `requirements`.** A lead that arrived through the
website form (`submit-client-brief`) has no call, no transcript and no lead folder, but it
does have structured content in the CRM: `need` is what they want, and `requirements` carries
the hosting, seats, country, languages, timeline and budget block. That is enough to
shortlist on. Read the Opportunity and treat those two fields as the criteria.

Names ending in `— marketplace brief` are always this second case. Never bounce one back to
`/twenty-lead-brief`: there is no transcript to give it, so that is a dead end.

**Neither?** Ask what exists (a transcript, a Fireflies ID or URL, an existing summary) and
run `/twenty-lead-brief` first.

**With a criteria file, be critical before querying anything.** Read it and check:

- At least 2 hard requirements, each with a justification.
- The language requirement is explicit.
- The required skills are specific enough to separate one partner from another. "Self-hosted
  Docker" does that; "technical" does not.
- Red flags are listed.

Thin on any axis means saying so and asking targeted questions first. A shortlist built on a
vague brief is noise.

**Working from `need` and `requirements` instead**, the same scrutiny applies but the bar is
lower: a form submission is short by design. Name what is missing (the criteria file would
have carried red flags and an engagement model) and shortlist on what is there. Say in the
output which of the two sources you used, so nobody mistakes a form-level match for a
call-level one.

---

## Phase 1 — Fetch and filter

Query every `VALIDATED` and `AVAILABLE` partner (see the shared reference). Paginate to the
end.

Apply the eliminators in this order. Each one is a hard fact, never a judgement.

**1. Empty profile.** A partner with no `country`, no `deploymentExpertise` and no
`introduction` cannot be assessed. Drop them and name them in one line at the bottom. As of
the last check that is 6 of the 29 validated partners, so the line is short and it doubles as
a chase list.

**2. Hard requirements from the criteria file.** Language and deployment are the usual two. A
partner missing a hard requirement does not appear among the candidates, not even with a
caveat.

**Price is never an eliminator.** Roughly half the partners have no rate on record, and at
least one rate is a day rate entered in an hourly field, so any threshold would cut on noise.
Price is shown as a fact and the user decides.

---

## Phase 2 — The shortlist

2 to 4 candidates by default. More only if the user asks.

For each, in this format:

```
## <Partner name> — fort / moyen / faible

**Pourquoi ça matche**
- point
- point
- point

**Ce qui manque ou est risqué**
- point

**Tarif** : <hourly> /h (≈ <hourly × 8> /jour) · budget projet min <amount>
**Contacts** : <name>, <email>
```

Rules:

- **Be honest.** One strong candidate and two weak ones is a real answer. Say why the others
  are weaker. Never inflate a score to fill a quota.
- **Never invent a capability.** An `introduction` is marketing copy the partner wrote about
  themselves. Only one partner in 29 has `twentyExperience` filled, so proof of real Twenty
  work is rare and worth calling out when it exists.
- Read the partner's **notes** (`noteTargets` filtered by `targetPartnerId`) when there are
  any. A `Partner call recap:` note carries what was actually said on a call, which beats
  self-written copy. About 5 partners have one.
- `partnerTier` is the user's own past judgement. Report it where set; never let it
  reorder the list.

Head the output with the lead's budget line from the criteria file, usually "not stated".
Show each partner's rate next to it. Do not compute a verdict from the comparison.

**Then list the ones you did not shortlist**, by name, one line, with the one fact that kept
them out:

```
Non retenus : Smotly (pas d'allemand) · OPALIA (cloud seulement) · Buildrhaus (…) · …
Écartés, profil vide : Giacomo · Shubham · Gaurav Trivedi · Devreet Dulay · Benjamin Reynolds
```

Without this the user can only remove, never add. Adding is half of what the review is for.

---

## Phase 3 — Save and stop

Save the whole output to `partner-shortlist.md` in the lead folder. Working from an
Opportunity, there is no folder yet: create `partners-experience/<company>/` and save it
there, so `twenty-partner-intro` has somewhere to write. Say which folder you used.

Then **stop**. Tell the user they can add, remove or change any candidate, and that
`/twenty-partner-intro` takes the names they settle on.

Do not ask "shall I write the emails?". Do not draft one in advance. End here.
