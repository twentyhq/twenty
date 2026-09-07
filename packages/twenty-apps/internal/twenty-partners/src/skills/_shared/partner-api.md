# Shared reference: credentials and API access

Every `twenty-partner-*` / `twenty-lead-*` skill reads this file instead of restating
credentials and queries. Fix a query here once, and every skill gets the fix.

## Credentials

All skills read `~/.twenty/credentials.env`:

```env
TWENTY_PARTNERS_API_URL=https://partners.twenty.com
TWENTY_PARTNERS_API_KEY=<key>
FIREFLIES_API_KEY=<key>
```

The partners key lives in `packages/twenty-apps/internal/twenty-partners/.env.prod`
(gitignored). Copy it to `~/.twenty/credentials.env` on first setup. The Fireflies key is
personal.

Which skill needs what:

| Skill | Partners URL + key | Fireflies key |
|---|---|---|
| `twenty-lead-brief` | yes (writes the Opportunity) | only for a Fireflies input |
| `twenty-partner-shortlist` | yes (read-only) | no |
| `twenty-partner-intro` | yes (writes Applications) | no |
| `twenty-partner-recap` | yes | yes |
| `twenty-partner-triage` | yes (read-only) | no |

**If a required key is missing, stop and name it.** Never proceed on a partial set.

## Helper

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

The `User-Agent` header is not optional: the Fireflies API rejects urllib's default.

Partners endpoint: `$TWENTY_PARTNERS_API_URL/graphql`.
Fireflies endpoint: `https://api.fireflies.ai/graphql`.

## Partner queries

**All partners available for work** (`twenty-partner-shortlist`). Paginate until
`hasNextPage` is false, passing `endCursor` as `$after`.

```graphql
query ListPartners($after: String) {
  partners(
    filter: { validationStage: { eq: VALIDATED }, availability: { eq: AVAILABLE } }
    after: $after
  ) {
    pageInfo { hasNextPage endCursor }
    edges { node {
      id name slug introduction
      languagesSpoken country region city
      deploymentExpertise partnerScope skills typeOfTeam
      partnerTier
      twentyExperience twentyExperienceNotes
      hourlyRate { amountMicros currencyCode }
      projectBudgetMin { amountMicros currencyCode }
      lastMatchAt
      persons { edges { node { name { firstName lastName } emails { primaryEmail } } } }
      company { id name domainName { primaryLinkUrl } }
    } }
  }
}
```

`amountMicros` is the amount times 1,000,000. Divide before displaying.

**All partners with contact + domain** (`twenty-partner-recap`, matching an attendee):

```graphql
query($a:String){ partners(after:$a){
  pageInfo{ hasNextPage endCursor }
  edges{ node{
    id name slug validationStage
    persons{ edges{ node{ name{ firstName lastName } emails{ primaryEmail } } } }
    company{ name domainName{ primaryLinkUrl } } } } } }
```

## Opportunity queries

**Find an existing Opportunity before creating one** (`twenty-lead-brief`):

```graphql
query($n:String!){ opportunities(filter:{ name:{ ilike:$n } }, first:5){
  edges{ node{ id name stage createdAt company{ name } } } } }
```

**Create** (`twenty-lead-brief`):

```graphql
mutation($d:OpportunityCreateInput!){ createOpportunity(data:$d){ id name } }
```

**Update** (`twenty-partner-intro`, to stamp `introSentAt`):

```graphql
mutation($id:UUID!,$d:OpportunityUpdateInput!){ updateOpportunity(id:$id,data:$d){ id } }
```

`designDocUrl` is a LINKS field: `{ "primaryLinkUrl": "<url>", "primaryLinkLabel": "Partner brief" }`.

## Application queries

An `Application` links a partner to an opportunity. State `INVITED` means Twenty pushed the
partner at the lead; `APPLIED` means the partner came forward on their own.

```graphql
query($oid:UUID!){ applications(filter:{ opportunityId:{ eq:$oid } }){
  edges{ node{ id state partner{ id name } } } } }

mutation($d:ApplicationCreateInput!){ createApplication(data:$d){ id state } }
# variables: { "d": { "opportunityId": "<id>", "partnerId": "<id>", "state": "INVITED" } }
```

## Company and person

`twenty-lead-brief` needs a `companyId` and a `pointOfContactId` on the Opportunity. Search
first, create only on a miss.

```graphql
query($n:String!){ companies(filter:{ name:{ ilike:$n } }, first:5){
  edges{ node{ id name } } } }
mutation($d:CompanyCreateInput!){ createCompany(data:$d){ id name } }

query($e:String!){ people(filter:{ emails:{ primaryEmail:{ eq:$e } } }, first:1){
  edges{ node{ id name{ firstName lastName } } } } }
mutation($d:PersonCreateInput!){ createPerson(data:$d){ id } }
```

## Note queries

```graphql
query($pid:UUID!){ noteTargets(filter:{ targetPartnerId:{ eq:$pid } }){
  edges{ node{ note{ id title bodyV2{ markdown } createdAt } } } } }

mutation($d:NoteCreateInput!){ createNote(data:$d){ id title } }
mutation($d:NoteTargetCreateInput!){ createNoteTarget(data:$d){ id targetPartnerId } }
mutation($id:UUID!,$d:NoteUpdateInput!){ updateNote(id:$id,data:$d){ id } }
```

## Fireflies queries

`date` is epoch milliseconds. `limit` is capped at 50: a higher value is a hard
`invalid_arguments` 400, not a soft clamp.

```graphql
query{ transcripts(limit:50){ id title date duration participants
  meeting_attendees{ displayName email } } }

query($id:String!){ transcript(id:$id){
  title date duration participants host_email organizer_email
  meeting_attendees{ displayName email }
  summary{ overview short_summary keywords }
  sentences{ speaker_name text } } }

mutation($id:String!){ deleteTranscript(id:$id){ id title } }
```

A Fireflies URL is `app.fireflies.ai/view/<slug>::<ID>`. The ID is the trailing `01K…`
segment.

## Opening a Gmail draft in Chrome

```python
import subprocess, urllib.parse, time, sys
params = {"view": "cm", "fs": "1", "to": to, "su": subject, "body": body}
if cc: params["cc"] = cc
url = "https://mail.google.com/mail/?" + urllib.parse.urlencode(params)
if sys.platform == "darwin":
    subprocess.run(["open", "-a", "Google Chrome", url])
else:
    import webbrowser; webbrowser.open(url)
time.sleep(1.5)
```

Two limits, both real:

- A `view=cm` URL always opens a **new** compose. It cannot reply inside an existing
  thread. A reply must be handed to the user as text to paste.
- A long body overflows the URL. Keep bodies to a few short paragraphs and link to the
  brief rather than pasting it.
