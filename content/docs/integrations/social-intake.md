---
title: Social intake (Chatwoot → CRM)
description: Design + as-planned spec for the Chatwoot social-messaging inbound channel — self-hosted Chatwoot as the omnichannel backend, FB/IG DMs → n8n → inboundActivity → the live pipeline, with the conversation embedded inside the CRM. Replaces Respond.io.
---

# Social intake (Chatwoot → CRM)

The social analog of [form-intake](./form-intake.md). Social DMs (Facebook +
Instagram now; WhatsApp/Telegram later) flow through a **self-hosted Chatwoot**,
which is the messaging backend. A Chatwoot webhook drives an n8n "Social Intake →
CRM" workflow that resolves platform + project + identity, dedups/creates the
Person, and writes **one `inboundActivity` per conversation**. From there the
**live lead pipeline** ([lead-pipeline](../systems/lead-pipeline.md)) produces the
Opportunity (`source = SOCIAL_DM`) and routes it for free — the pipeline is
channel-agnostic.

The differentiator vs. form-intake: managers **read and reply to the conversation
inside the CRM** (an embedded Chatwoot view), so they never switch apps. This
replaces Respond.io entirely.

> Status: **Phases 0–3 + stage-2 + Phase 5 LIVE** (2026-06-04). Infra, fork patches,
> 5 brands/10 inboxes, n8n intake → pipeline → Opportunity, Person-merge, and the
> **in-CRM native chat panel** (read/reply on Opportunity + Person, on-claim
> assignment) — all verified. PRs #3–#12 on `main`. Only App Review (public DMs)
> deferred. See the Phase-5 as-built below + `docs/PHASE5_GATES.md` (boot/deploy
> lessons).
>
> **As-built (live):**
> - Self-hosted Chatwoot on Railway project **`enso-chatwoot`**
>   (`6f2f50fd-1f6e-4a45-ad34-a8a5f9141b1b`): `chatwoot-web` (`4295ecaa…`, Puma
>   :3000) + `chatwoot-worker` (`b6a992fa…`, Sidekiq) + Postgres (`70d51b73…`) +
>   Redis (`ec0a6d52…`). Serving at **https://chat.enso.ro** (custom domain,
>   targetPort 3000, DNS CNAME → `2hh9zkhv.up.railway.app`).
> - Built from fork **`corporateready/chatwoot@enso-production`** (off v4.14.1);
>   push auto-deploys both services. `preDeployCommand = rails db:chatwoot_prepare`.
>   DB seeded (101 installation_configs); super-admin + account 1 created.
> - **Phase 1 fork patches:** referral capture (`423af00`) + iframe embedding
>   (`cc40974`, Rack middleware gated on `ENSO_FRAME_ANCESTORS=https://crm.enso.ro`)
>   + Dockerfile `.git_sha` fix (`2ef5563`). Verified: chat.enso.ro has no
>   `X-Frame-Options`, `CSP: frame-ancestors 'self' https://crm.enso.ro`.
> - Creds in repo `.env` (`CHATWOOT_BASE_URL`/`ACCOUNT_ID=1`/`API_TOKEN`, working).
>   `FORCE_SSL` still `false`. Railway ops via CLI (token auto-refresh) or GraphQL
>   API (CLI token + `User-Agent` header); **GitHub-repo connect + custom-domain
>   creation need the dashboard** — the CLI token isn't scoped for them.

## Decisions (settled)

| # | Decision | Rationale |
|---|---|---|
| D1 | **Human-only, no AI auto-reply** (this phase) | A human manager replies; "chatbot" = the social pipeline, not an AI agent. AI greet/qualify is a separate, later build. |
| D2 | **Chatwoot is the omnichannel layer** | Chatwoot already normalizes FB/IG/WhatsApp/Telegram into one model + one webhook + one API. Our CRM side talks only to Chatwoot → adding a channel never touches n8n/pipeline/embed. |
| D3 | **One Meta app** hosts Messenger + Instagram (+ later WhatsApp Cloud API) | Self-owned, fee-light, no middleman. Business Verification/setup amortized across 3 channels. BSP kept only as a WhatsApp-ops option or App-Review escape hatch. |
| D4 | **Deploy fresh Chatwoot on Railway** (our fork) | Need fork control for the two patches below. |
| D5 | **Patch the Chatwoot fork to capture Meta ad referral** | Chatwoot's Meta parser silently drops the `referral` object — without a patch, ad attribution is unreachable. |
| D6 | **Embed via iframe + invisible SSO**, CRM-only | Fast, full-feature; the iframe *is* the full Chatwoot conversation UI. Managers ideally never open Chatwoot directly. |
| D7 | **CRM drives assignment**, pushed into Chatwoot | Chatwoot auto-assignment OFF; the existing routing/claim pipeline picks the owner and pushes it into Chatwoot. One source of truth. |
| D8 | **`crm.enso.ro` + `chat.enso.ro`** (shared parent domain) | Same-site so Chatwoot's `SameSite=Lax` session cookie works inside the CRM iframe. |
| D9 | **Route iff a project is resolved**; else activity-only | Ads (ref → project) and brand/umbrella inboxes route immediately; organic on the unknown bucket logs an activity for triage with no Opportunity/ping. |
| D10 | Map managers → Chatwoot agents **by email** | Reuse the existing roster; no separate mapping table. |

## Architecture

```
Meta CTM/IG ads (marketing sets ref=proj+utm…) + organic DMs
        │
        ▼
chat.enso.ro  ← Chatwoot on Railway (OUR fork; v4.1+)
   • PATCH 1: persists Meta referral (ref/ad_id/ads_context) → conversation.additional_attributes
   • PATCH 2: X-Frame-Options/CSP frame-ancestors allows framing by crm.enso.ro
   • auto-assignment OFF on every inbox
   • inboxes: FB + IG for each of the 5 pages (Instagram Business Login path)
        │ webhook (conversation_created / message_created, secret-in-path)
        ▼
n8n "Social Intake → CRM"  (clone of Form Intake → CRM)
   • resolve: platform (inbox channel) + project (inbox map + ref override) + identity
   • parse referral → organic vs ads (reuse legacy two-tier resolver)
   • dedup/create Person; ONE inboundActivity per conversation (idempotency key = chatwootConversationId)
   • route-iff-project-resolved (D9): ads/brand/umbrella → route; organic-unknown → activity-only
        │
        ▼
LIVE pipeline (unchanged): Opportunity (source SOCIAL_DM) → routing → claim
        │ on claim
        ▼
CRM hook pushes conversation assignment INTO Chatwoot (mapped agent, via API)
        │
        ▼
crm.enso.ro → manager opens the deal → Twenty tab with iframe:
   server mints 5-min SSO URL for the mapped agent → deep-links to the conversation
   → manager reads & replies in-CRM (Chatwoot never opened directly)
```

## Channels & inbox → project map

Each Facebook page and each Instagram account is its own Chatwoot inbox; the join
key in Chatwoot's webhook/API is **`inbox_id`** (organic page identity). Instagram
uses the **Instagram Business Login** path (Chatwoot v4.1+); the legacy
"Instagram via Facebook Login" is deprecated.

| Chatwoot inbox | Channels | Default project | code | Project resolution |
|---|---|---|---|---|
| ENSO Development **Moldova** | FB + IG | ENSO ESTATE (MD) | ENS2502 | umbrella — ad `ref` can sharpen to a more specific MD project |
| ENSO Development **Romania** | FB + IG | ENSO LIVING (RO) | ENS2501 | umbrella — ad `ref` can sharpen |
| ARTIMA Business & Lifestyle | FB + IG | ARTIMA | ENS2301 | brand — fixed |
| AVRAM IANCU | FB + IG | AVRAM IANCU | ENS2402 | brand — fixed |
| VANZARI IMOBILIARE | FB + IG | **unknown → ENSVI** | ENSVI | general bucket — project decided in conversation; ad `ref` routes correctly from the start |

No social inbox for TRIUMF BOTANICA (ENS2101) or the ENSO Development umbrella
record (ENS00). WhatsApp/Telegram inboxes added later under the same model.

## Organic vs ads attribution

Two shapes, exactly as the legacy Respond.io flow modeled:

- **Organic** — no referral. Project comes from the inbox (`inbox_id` → map above).
  On the umbrella inboxes that's the country default; on Vanzari it's *unknown*.
- **Ads** (Click-to-Messenger / Click-to-Instagram) — Meta attaches a `referral`
  object to the first message: `ref` (our custom string), `ad_id`, `source:"ADS"`,
  and `ads_context_data`. **`ref` is our project + UTM carrier.**

### ⚠️ Chatwoot drops the referral — hence PATCH 1

Verified in Chatwoot source: `Integrations::Facebook::MessageParser` and the
Instagram builders read only sender/text/attachments and **never read
`messaging.referral` / `postback.referral`**; `additional_conversation_attributes`
is `{}`. So out of the box the ad attribution is unreachable via webhook or API
(corroborated by chatwoot/chatwoot issue #12560). **PATCH 1** extends the Meta
parser/builder to persist `referral` (`ref`, `ad_id`, `ads_context_data`) into
`conversation.additional_attributes`, so it then flows natively through the
Chatwoot webhook to n8n — mirroring how form-intake gets PostHog data.

To receive the referral the channel must subscribe to the referral webhook field
as well as `messages` — and Meta names it differently per object: the **page**
object takes **`messaging_referrals`** (plural), the **instagram** object takes
**`messaging_referral`** (singular). `messaging_referrals` fires when a contact
returns to an *existing* thread from an ad or an `m.me?ref` link; a *new*
ad-initiated thread instead carries the referral inside the first `messages`
event (or a `messaging_postbacks` payload), which is why PATCH 1 reads both
`messaging.referral` and `postback.referral`.

⚠️ **This was missing until 2026-09-08.** Chatwoot's own `subscribe` calls never
included either field, so the live channels asked Meta only for
`messages, message_deliveries, message_echoes, message_reads, standby,
messaging_handovers` (pages) and `messages, message_reactions, messaging_seen`
(Instagram) — see the as-built note at the end of this page.

### The `ref` scheme (hand to the marketing team)

We control ad creation, so the digital-marketing team sets each CTM/CTD ad's
**`ref`** to a URL-encoded query string carrying an explicit project code plus the
standard UTMs:

```
proj=ENS2502&utm_source=facebook&utm_medium=paid_social&utm_campaign=<campaign>&utm_content=<ad>&utm_term=<adset>
```

n8n resolution order for the project:
1. `ref.proj` (explicit code) — authoritative; overrides the inbox default.
2. else campaign-name/`ad_id` regex (legacy two-tier fallback).
3. else the inbox default (umbrella country project / brand).
4. else *unknown* (Vanzari organic) → activity-only per D9.

UTMs from `ref` populate the `inboundActivity` attribution fields exactly like the
form channel, and the pipeline freezes them onto the Opportunity's first-touch
snapshot.

### Attribution tiers when the ad forgets its `ref` (2026-09-08)

An ad can reach us with an `ad_id` and no `ref` — a creative the marketing team
built without the query string, which used to mean `trafficType=PAID` with five
empty utm fields. The Social Intake workflow now degrades in three steps
(`Needs ad lookup?` → `Read Ad` → `Ad Attribution`, between the idempotency check
and the person lookup):

| tier | source | fills |
|---|---|---|
| 1 | `referral.ref` | everything, exactly as before — always wins |
| 2 | `GET /{ad_id}?fields=name,adset{name},campaign{name}` | `utm_campaign` = campaign name, `utm_content` = ad name, `utm_term` = adset name |
| 3 | `referral.ads_context_data.ad_title` | `utm_content` = the ad's headline |

Any tier that fires also sets `utm_source` = `instagram`/`facebook` from the
platform and `utm_medium` = `paid_social`.

⚠️ **Tier 2 is dark today.** It reuses the `Facebook Lead Ads system token`
credential, which has no `ads_read` / `ads_management` scope on the ad account:
the call returns `GraphMethodException` code 100 subcode 33 (*"cannot be loaded
due to missing permissions"*), the node is `neverError` + `onError:
continueRegularOutput`, and the flow drops to tier 3. Grant that scope (or point
the credential at a system-user token that has it) and tier 2 starts working with
no workflow change. The failure text is kept on the item as `adLookupError` for
the execution log; it is never written to the CRM.

Verified live with two synthetic conversations (both cleaned up): `ad_id` only →
`PAID` + `instagram` / `paid_social` / ad title in `utm_content`; full `ref` →
the `ref` values untouched.

## Identity resolution

Dedup the Person by **phone → email → social handle**, in that order (drop the
legacy name-match — too loose). Chatwoot's contact carries phone/email/identifier
+ the platform handle. Phone normalization reuses the form-intake length rule
(8→`+373` MD, 9→`+40` RO). The social handle/id is stored on the
`inboundActivity` (`externalId` / `distinctId`); a dedicated Person social-handle
field is optional and can be added later if needed for matching.

## Social profile enrichment

What we can and can't auto-fill from a social DM:

- **Instagram** — the handle arrives in the `conversation_created` payload, so n8n sets the Person's **`instagramLink`** automatically.
- **Facebook Messenger** — we only get a **page-scoped PSID**, not a public profile URL; there is **no Facebook profile link** to populate. The thread is reachable via a deep link, not a profile.
- **`ids_for_business`** (Meta's cross-page user id) is effectively unavailable — don't rely on it.
- **Avatar / profile picture** is **gated behind Meta App Review** — not fetched.
- **LinkedIn / X** can't be derived from DM intake; they stay manual.

So of the social links, only Instagram is auto-populated; the rest are manual or unavailable.

## Conversation granularity / dedup

**One `inboundActivity` per Chatwoot conversation.** Create on
`conversation_created` (or first inbound `message_created`), using
**`chatwootConversationId` as the idempotency key** — skip if an activity with
that id already exists. Later messages in the same conversation do **not** create
new activities or deals; the pipeline's person×project open-deal dedup handles
deal-level idempotency. `externalThreadId` stores the platform thread id.

## The embedded agent experience (iframe + SSO)

Verified against Chatwoot source. Self-hosted only (Platform APIs aren't on
Chatwoot Cloud).

- **SSO mint:** `GET /platform/api/v1/users/{id}/login` (auth header
  `api_access_token` = the **Platform App** token, created in the super-admin
  portal). Returns `{ "url": "<FRONTEND_URL>/app/login?email=…&sso_auth_token=…" }`.
  The token is **5-min TTL, single-use** → mint server-side at the moment of iframe
  render; never cache.
- **Deep-link is two-step:** the SSO URL establishes the session at `FRONTEND_URL`,
  then navigate the iframe to `/app/accounts/{accountId}/conversations/{conversationId}`.
  Store `chatwootConversationId` on the activity/opportunity to build the link.
- **PATCH 2 (X-Frame-Options/CSP):** Rails ships `X-Frame-Options: SAMEORIGIN` by
  default and Chatwoot exposes **no env toggle**. An initializer must delete it and
  set CSP `frame-ancestors 'self' https://crm.enso.ro`.
- **Cookies (why D8):** the session cookie is `SameSite=Lax`, which is **not sent
  in a cross-site iframe** → login loop. Hosting Chatwoot on `chat.enso.ro` (same
  parent as `crm.enso.ro`) keeps it same-site so `Lax` works. (The `SameSite=None;
  Secure` alternative is fragile under third-party-cookie blocking — avoided.)
- **ActionCable:** `FRONTEND_URL` and the websocket origin must match the host the
  iframe loads; the proxy must allow WS upgrade — common cause of "logged in but
  stuck."

## Assignment push-back + agent provisioning

- **Provisioning:** create a Chatwoot agent per manager via the Platform API
  (`POST /platform/api/v1/users`, then `POST …/accounts/{id}/account_users` with
  role `agent`); add inbox membership via the Application API
  (`POST /api/v1/accounts/{id}/inbox_members`). Map to `workspaceMember` **by
  email** (D10). Account membership is mandatory or the SSO'd dashboard hangs.
- **Push-back:** a new enso server hook — on claim (deal leaves ROUTING with an
  owner), assign the Chatwoot conversation to the mapped agent via the Chatwoot
  API. Chatwoot auto-assignment stays OFF so the CRM is the single source of truth.

## `inboundActivity` mapping

The object is already social-ready (no rebuild). Per conversation, write:
`kind = SOCIAL_MESSAGE`, `source = CHATWOOT`, `platform`
(INSTAGRAM/FACEBOOK/…from the inbox channel type), `chatwootConversationId`,
`externalThreadId`, `body`, `person`, `project` (or null when unresolved),
`externalId`/`distinctId` (social id/handle), attribution (`utm*`, landingPage =
n/a), `submittedPayload` (the raw Chatwoot conversation payload as the safety net),
`isSynthetic` (test/junk flag). The pipeline maps `kind = SOCIAL_MESSAGE →
opportunity.source = SOCIAL_DM`.

## Consent

An inbound social DM opens a **service / reply window** — we may answer that conversation — but it is **not** marketing consent. Social channels are deliberately excluded from automated marketing-consent grants; only form / lead-ad intake (which carries Terms + Privacy) grants marketing consent. To market later on SMS/WhatsApp/email/call, a manager records an explicit (VERBAL) consent. The reply window itself is enforced via Chatwoot's `can_reply` ([chatwoot-conversations](./chatwoot-conversations)). Full model, against the live code: [consent](../systems/consent).

## Meta app setup (Business-Manager admin)

**Key finding:** for assets you **own or manage**, Meta grants **Standard Access**
— *"Advanced Access is needed if your app serves accounts you don't own or manage,
while Standard Access suffices for accounts you own or have added to your App
Dashboard."* So the demo-video **App Review is likely NOT required** for our own
5+5 assets. **Business Verification is already DONE** (the agency BM is verified —
confirmed 2026-05-31), which removes the only multi-day external dependency; the
path is now gated solely by our own build pace. *(Treat "zero App Review" as
verify-in-practice during the smoke test; Chatwoot's own docs still phrase it for
the multi-tenant default.)*

### Pages under different businesses (agency model)

Pages owned by **different** businesses are fine **if** they're assigned to the one
agency Business Manager (owned or via **partner/agency access**) and the connecting
admin manages them — Meta counts managed-via-partner-access as "manage," so
Standard Access still applies. Requirements:
1. **Consolidate** every page + its IG account under the single agency BM; the
   **app lives in that BM**, and that BM is the one verified.
2. **One connecting admin** (a person or a System User) with admin on *all* pages,
   so a single Chatwoot OAuth grant attaches them all.
3. **Fragility:** if a client revokes the agency's partner access, that inbox
   breaks; and a cross-owned asset *could* be flagged as needing Advanced Access —
   another verify-in-smoke-test item, with App Review (routine on a verified BM) as
   the fallback.

### Checklist (⏳ = long-lead)

1. **✅ Business Verification — DONE** (agency BM verified, 2026-05-31). No wait.
2. Assign all 5 Pages + 5 IG pro accounts to the **agency BM** (own or partner
   access); create a **Business-type** Meta app under it.
3. Add admins/devs + **Instagram Tester** roles for pre-prod testing (full pipeline
   is testable in Development mode with role-holders).
4. **Messenger:** add Facebook Login + Messenger products; allow `https://chat.enso.ro`
   as OAuth domain; webhook → `https://chat.enso.ro/bot`, verify token =
   `FB_VERIFY_TOKEN`; subscribe `messages, messaging_postbacks, messaging_referrals,
   message_echoes, message_deliveries, message_reads`. *(`messaging_referrals` feeds
   PATCH 1.)* Permissions: `pages_messaging, pages_manage_metadata, pages_show_list,
   pages_read_engagement, business_management`.
5. **Instagram (Business Login, v4.1+):** add Instagram product; set
   `INSTAGRAM_APP_ID/SECRET/VERIFY_TOKEN` (distinct from the FB app id) + enter at
   `/super_admin/app_config?config=instagram`; webhook →
   `https://chat.enso.ro/webhooks/instagram`; redirect →
   `https://chat.enso.ro/instagram/callback`; subscribe `messages, messaging_seen,
   message_reactions, messaging_referral` *(singular on the instagram object —
   this is the ad-attribution field)*; permissions `instagram_business_basic,
   instagram_business_manage_messages`.
6. Set app **Live** (required for IG webhooks; only own/added assets connected).
7. Create the FB + IG inboxes in Chatwoot via the Login flows; attach assets;
   **disable auto-assignment** on every inbox.
8. **⏳ WhatsApp (later):** add WhatsApp product, WABA + number, display-name
   approval — its own long-lead items.

## Infra (Railway)

- New Railway service set in (or alongside) the existing projects: **Chatwoot**
  (Rails app + Sidekiq worker) + **Postgres** + **Redis**, built from our Chatwoot
  fork (for PATCH 1/2). Mirror the twenty-worker lesson — ensure Railway builds
  *our* image, not the upstream one.
- **DNS (we control `enso.ro`):** `crm.enso.ro` → twenty-server, `chat.enso.ro` →
  Chatwoot; Railway custom domains + TLS. Moving the CRM to `crm.enso.ro` is a small
  migration off the `*.up.railway.app` host.
- Chatwoot env: `FRONTEND_URL=https://chat.enso.ro`, `FORCE_SSL=true`, secret key
  base, the Meta app vars above. n8n webhook auth = secret-in-path (Chatwoot
  webhooks can't send custom auth headers), analogous to form-intake's
  `x-intake-secret`.

## Phased plan

| Phase | What | Risk |
|---|---|---|
| **0 · Infra** | Deploy Chatwoot (app+worker+PG+Redis) on Railway from our fork; DNS `crm.`/`chat.enso.ro` + TLS. | DNS/migration; ensure our image builds. |
| **1 · Fork patches** | PATCH 1 (referral capture) + PATCH 2 (X-Frame/CSP). | Second fork to carry across upgrades. |
| **2 · Channels** | Meta app (1 app, Messenger + IG products); connect 5 FB + 5 IG inboxes; auto-assign OFF. | Agency-access consolidation; verify Standard Access. (Business Verification ✅ done.) |
| **3 · n8n intake** | Clone Form Intake → Social Intake; webhook → resolve (platform/project/identity + ref parse) → one inboundActivity/conversation; route-iff-project (D9). | Low — mirrors a proven workflow. |
| **4 · Assignment push-back** | Provision agents (email map); on-claim hook assigns the Chatwoot conversation. | Low–med. |
| **5 · Embedded UI** | Twenty tab on the deal: server mints SSO URL → iframe → deep-link. Validate cookie/CSP/WS end-to-end. | Med — the iframe behavior. |
| **6 · Triage + verify** | CRM view of project-less SOCIAL_MESSAGE activities; smoke-test FB+IG (organic + ads), dedup, claim→assign→reply-in-CRM; clean up test records. | Low. |

The Opportunity + routing between phases 3 and 4 is **already shipped**.

## Out of scope (this phase)

- **AI auto-reply / qualification bot** — humans reply (D1). A later layer.
- **WhatsApp** — same Meta app hosts it (Cloud API) or a BSP (360dialog) for ops;
  deferred until a WhatsApp Business number is provided.
- **Telegram** (trivial bot token) / **TikTok DMs** (no general business DM API
  today) — future channels; the pipeline is already channel-agnostic.
- **Outbound cadence / templates** via Chatwoot — later.
- **Opt-out half** of consent (unsubscribe/STOP) — built with the senders.
- **Message-level analytics / warehousing** (Chatwoot Postgres → BigQuery via
  Fivetran + dbt) — **owned by the separate analytics project**, NOT this CRM. The
  Chatwoot Postgres (ours) is a normal source the analytics stack can tap when it
  wants message-level attribution; nothing to build here. (Decided 2026-06-05.)
- **Human-agent 7-day window** — deferred; it rides with **App Review** (the
  `human_agent` permission). Until then the reply window is 24h (Chatwoot
  `can_reply` enforces it). When App Review lands, enable human-agent **and** bump
  Chatwoot `auto_resolve_after` 1440 → `10080` (7 days).

## Open items / verify-in-practice

- **Standard Access vs App Review** for own + agency-managed assets — confirm during
  the smoke test before go-live.
- **Chatwoot v4.1.x Instagram-inbox bugs** (chatwoot issues #11577/#11578/#12275) —
  QA on the pinned version.
- **PATCH 1/2 upgrade cost** — track against Chatwoot releases.
- **Person social-handle field** — add only if handle-based dedup proves necessary.
- **`ref` adoption** — depends on the marketing team setting the agreed string on
  every ad; organic-on-umbrella still resolves via the inbox default.

## As-built — Phases 2–3 + stage-2 (2026-06-03)

**Meta app** "ENSO Chatwoot" (App ID `1372861104654929`) under BM **ENSO
Development Moldova** (verified). Messenger + Instagram (Instagram-Login) use
cases. Webhooks: Messenger `…/bot`, Instagram `…/webhooks/instagram`; verify
tokens `enso-fb-…` / `enso-ig-…`. **Meta creds live in Chatwoot super-admin**
(`/super_admin/app_config?config=facebook` & `?config=instagram`), **NOT Railway
ENV** — `GlobalConfigService` reads the DB `InstallationConfig` first and the seed
pre-creates blank rows, so ENV is shadowed (its `first_or_create` ENV-fallback
returns the existing blank). Set FB_APP_ID/SECRET/VERIFY_TOKEN +
INSTAGRAM_APP_ID/SECRET/VERIFY_TOKEN there.
- **Dev-mode gotchas:** Facebook delivers tester DMs in Development; **Instagram
  requires the app PUBLISHED/Live** to deliver webhooks at all. Sender must be an
  **app role** (admin/tester) until App Review. IG sender ≠ receiver (can't DM
  self) → use a second tester IG account. **App Review (`pages_messaging`,
  `instagram_business_manage_messages`) is required to receive *public* DMs** —
  the go-live gate (Meta's own UI confirms; the earlier "Standard-Access, no
  review" hope was wrong for messaging).

**Inboxes (Chatwoot account 1), auto-assignment OFF on all:**

| inbox_id | channel | name | page_id | → project (UUID) |
|---|---|---|---|---|
| 1 / 2 | FB / IG | Artima | `104832627735882` | ARTIMA `4b63d540-…` |
| 3 / 6 | FB / IG | ENSO Development Moldova | `824873130700445` | ENSO ESTATE `2b0b2f11-…` (MD default) |
| 4 / 5 | FB / IG | Vânzări Imobiliare | `585329244673786` | **null** (unknown bucket; ENSVI `153c97f9-…` only via ref) |

Still to connect: ENSO Dev Romania → LIVING `c2fc149f-…`, AVRAM IANCU `52d75b8d-…`.
Project codes→UUIDs also: ENS2101 TRIUMF `1af69943-…`, ENS00 ENSO Dev `82e62d0d-…`.

**Stage-1 — n8n "Social Intake → CRM"** (workflow `4cJGl1W55UFDBGTw`, active).
Chatwoot **account webhook id 1** → `…/webhook/chatwoot-intake-9a992cbe851c48ac`,
subscribed to **`conversation_created` only** (deliberate: `message_created` also
fires per DM and raced the idempotency check → duplicate activities; one event
per conversation fixes it). Flow: Webhook → **Resolve** (event/channel→platform,
inbox→project + `ref.proj` override, PSID identity, referral parse, synthetic
flag, occurredAt) → **idempotency** (find inboundActivity by
`chatwootConversationId`; exists → stop) → **Find Person by PSID** (via
inboundActivity `externalId`) → create-or-reuse Person → **create inboundActivity**
(`kind=SOCIAL_MESSAGE`, `source=CHATWOOT`, platform, projectId-or-null, body,
externalId/distinctId=PSID, submittedPayload, isSynthetic). Project null → the
live pipeline skips opportunity creation (route-iff-project / D9). n8n expressions
can't use arrow-IIFEs and need spaces around ternary `?:` (else parsed as
optional-chaining). **Verified end-to-end: FB + IG → inboundActivity; idempotency;
full pipeline → Opportunity `source=SOCIAL_DM` (routing parked — ARTIMA has no
routing pool yet).**

**Paid vs organic (2026-06-05).** Resolve derives
`trafficType = (referral && (referral.source==='ADS' || referral.ad_id)) ? 'PAID'
: 'SOCIAL'` and Create writes it; the opportunity's existing
`coerceTrafficType(activity.trafficType)` then **freezes `firstTrafficType =
PAID|SOCIAL`** at origin (no CRM change). Verified live (synthetic paid → `PAID` +
parsed UTMs; organic → `SOCIAL`; test records cleaned up). ⚠️ **`trafficType` is the
only writable attribution field added** — `ad_id` / `ref` / `isPaid` are **NOT
fields on `InboundActivityCreateInput`** (a create with them → `BAD_USER_INPUT`,
which briefly broke intake during the build until reverted). The ad_id / raw ref
are retained in `submittedPayload` (the raw Chatwoot payload) for the DWH; `utm*`
are parsed from `ref` as before. Workflow backup at `/tmp/social-workflow-backup.json`.

**⚠️ No referral had ever arrived — referral fields now subscribed (2026-09-08).**
Triggered by a marketing-room post reading `no attribution — this lead arrived
untagged`. Findings, all verified live:

- **0 of 854** Chatwoot conversations have any `additional_attributes` at all, so
  PATCH 1 has never had a referral to persist — even though the patch **is** in
  the deployed image (`423af00` is an ancestor of the live SHA `6f6ab5c`).
- The live `subscribed_apps` field lists carried **no referral field**: 5/5 FB
  pages had `messages, message_deliveries, message_echoes, message_reads, standby,
  messaging_handovers`; the IG accounts had `messages, message_reactions,
  messaging_seen`. Fixed by hand via the Graph API — all 5 pages now also carry
  `messaging_referrals`, and Artima + Vânzări IG carry `messaging_referral`
  (verified by re-reading each channel). Persisted in the fork by
  corporateready/chatwoot#1 so `after_create_commit :subscribe` cannot drop it on
  the next re-authorization — **merged and deployed 2026-09-08**, live SHA
  `f4102ca` (previous `6f6ab5c` is the rollback point). ~10 min build, and the
  swap cost no observable downtime: `chat.enso.ro` answered 200 on every 20s poll
  across the whole window. Verified after the deploy: both patched subscribe lists
  are in the running image, CSP `frame-ancestors` (PATCH 2) intact, Chatwoot API
  up, account webhook still `conversation_created` → the n8n intake path, and all
  7 live channels still carry the referral field — a change to
  subscribe-on-create cannot touch existing subscriptions.
- **3 Instagram channels are dead**: ENSO Dev Moldova (inbox 6), Avram Iancu (9)
  and ENSO Dev România (10) IG tokens expired 2026-08-02 (`Session has expired`),
  so they could not be re-subscribed and are not delivering DMs either. Artima IG
  expires 2026-09-21, Vânzări 2026-09-24 — **both need re-authorizing before those
  dates or they go the same way silently.**

  Re-auth is a human step in Chatwoot: **Settings → Inboxes → the inbox →
  Reconnect**, which runs the Instagram Business Login OAuth
  (`instagramClient.generateAuthorization` → `/instagram/callback`) and writes a
  fresh token + `expires_at` onto `channel_instagram`. Whoever clicks it has to be
  logged in to Meta with admin rights on that Instagram professional account.

  ⚠️ **Chatwoot did not know they were dead.** `reauthorization_required` was
  `false` on all ten social inboxes, because the flag is only set after
  `AUTHORIZATION_ERROR_THRESHOLD` (2) *outbound* API failures — and nobody had
  replied through those inboxes. So the UI showed no Reconnect button while the
  channel was silently down. Set by hand on 2026-09-08 for inboxes 6/9/10 by
  writing the Redis key directly
  (`REAUTHORIZATION_REQUIRED:channel_instagram:{3,4,5}`) rather than calling
  `prompt_reauthorization!`, which would also have emailed the account admins an
  `instagram_disconnect` notice. `reauthorized!` clears both keys after a
  successful reconnect.

  Reconnecting the **same** Instagram account is safe and in-place:
  `Instagram::CallbacksController#find_or_create_inbox` looks the channel up by
  `instagram_id` and `update!`s the token + `expires_at` on it, keeping the inbox,
  its conversations, its agents and our hand-added `messaging_referral`
  subscription (`after_create_commit :subscribe` does not re-run on an update).
  Only authorizing a *different* account creates a new channel + inbox — and that
  one now subscribes with the referral field too, since
  corporateready/chatwoot#1 is deployed. Note the reconnect renames the inbox to the
  Instagram username; harmless, since n8n maps projects by inbox **id**.

**Token-expiry monitor (live 2026-09-08).** n8n workflow **`Chatwoot Token Expiry
Watch`** (`ZPlGI7PHrniWwxas`, daily 08:40, `errorWorkflow` = Intake Error Alerts)
reads `channel_instagram.expires_at` and posts to the ops Google Chat space
(`AAQA-eMmZDo`, same as the lead-ad watchdog) when a token has expired, expires
within 14 days, or has no expiry recorded. Silent otherwise. First run against
live data: 3 expired, 1 expiring in 13 days (Artima).

It reads the Chatwoot DB through a **dedicated read-only role** rather than the
superuser: `n8n_readonly`, `SELECT` on `channel_instagram`,
`channel_facebook_pages`, `inboxes` only — verified it cannot read
`conversations` or write anything. n8n credential *Chatwoot DB (read-only)*
(`nv26IyiWGMaFgGtf`) over the public TCP proxy. Rollback: `drop role n8n_readonly`
plus deleting that credential. FB page tokens carry no expiry column, so only
Instagram is watched.

### Granting `ads_read` for attribution tier 2

The credential the `Read Ad` node reuses belongs to system user
**`ENSOCRMENRICHMENT`** (`122133623625354657`) on app **ENSO Lead Ads**
(`877859282026498`), and its granted scopes are exactly `pages_show_list`,
`pages_read_engagement`, `leads_retrieval`, `public_profile` — no `ads_read`, no
`business_management` (`/me/businesses` → *(#100) Missing Permission*). It manages
6 pages: Artima, ENSO Development Moldova, ENSO Development România, Vânzări
Imobiliare, Avram Iancu, READY.

Adding the asset is not enough — **a system-user token's scopes are fixed when the
token is generated**, so tier 2 needs a token minted *with* `ads_read`:

1. Business Settings → Users → System users → the system user → **Add assets → Ad
   accounts** → the ad accounts running those brands' campaigns → **View
   performance** (that is `ads_read`).
2. **Generate new token** against the ENSO Lead Ads app with `ads_read` included.
3. Put it in an n8n credential and point `Read Ad` at it.

⚠️ Prefer a **separate** system user / credential for this. Overwriting *Facebook
Lead Ads system token* (`bMIbvMPFyVcJEUPV`) also re-tokens the live Lead Ad
intake, and a regenerated token missing `leads_retrieval` or
`pages_read_engagement` breaks lead fetching. To find which ad account to grant,
look up ad id `120243558339980604` (a real one from a recent lead) in Ads Manager.
- The subscription gap is **not proof** that paid social leads were mis-attributed:
  an ads-initiated *first* message carries its referral inside the `messages` event
  we already had. The likelier reason no referral has ever appeared is that no
  click-to-Messenger / click-to-Direct ads have been running with a `ref` — paid
  social spend currently goes through the Lead Ads channel, whose activities do
  arrive `PAID` with full UTMs. **Open question for marketing.**
- Also fixed CRM-side: the marketing-room post now names the platform
  (`Instagram Social Message` — `platformPrefix` had been reading `source`, always
  `CHATWOOT`, instead of `platform`) and distinguishes an organic DM from a lost
  campaign (`no utm tags — organic Instagram DM, no ad click to attribute`)
  instead of calling every untagged social touch `untagged`.
- Still not covered: a referral that carries only `ad_id` and no `ref` yields
  `trafficType=PAID` with empty `utm_*` — nothing maps `ad_id` → campaign.

**Auto-resolve on window close (2026-06-05, live config).** Chatwoot account
`settings.auto_resolve_after = 1440` (minutes = 24h; set via
`PATCH /api/v1/accounts/1`, no `auto_resolve_message` so nothing is sent to the
contact). With every inbox `lock_to_single_conversation = false`, a conversation
auto-resolves after 24h of inactivity, so the contact's **re-engagement opens a
NEW conversation** → `conversation_created` → a fresh `inboundActivity` carrying
the new ad's attribution → pipeline (attach to the open same-project deal, or new
deal if closed). This is the mechanism that captures mid-funnel re-engagement
**without** a separate `messaging_referrals` branch. ⚠️ 24h matches today's real
reply window; **bump to `10080` (7 days) once App Review enables the human-agent
extension** (`auto_resolve_after` is stored under `settings`, not the deprecated
top-level mirror).

**Stage-2 — Person merge-on-phone/email** (the legacy "Merging Contacts" analog;
the identity-merge the CRM lacked). **Deployed + VERIFIED live** (2026-06-03;
commits `dcc7930c58` + `774924fa8f` + `fdd626aee5` on main). A live-test bug — the
finder read flat column names, but the workspace ORM returns composites **nested**
(`person.phones.primaryPhoneNumber`, `emails.primaryEmail`, `name.firstName`) — was
fixed in `fdd626aee5`. **Verified:** two People sharing a phone → oldest kept,
duplicate soft-deleted, the duplicate's `inboundActivity` reassigned to the keeper. ✅
Files under `packages/twenty-server/src/modules/enso/person-merge/`: POST hooks on
`person.createOne`/`updateOne` → `FindPersonDuplicatesJob` (match by `primaryEmail`
or phone **last-9** digits, excl. self/deleted) → `MergePersonDuplicatesJob` →
`PersonMergeExecutorService` (keep **oldest**; reassign person FKs on opportunity/
inboundActivity/personProjectConsent/personProjectAssignment/personRelationship;
backfill keeper's empty contact/name/company; soft-delete dups). New queue
`ensoPersonMergeQueue` (priority 4); registered in `JobsModule` +
`WorkspaceQueryHookModule`. Stage-1 dedups social by **PSID** (precise, avoids
name-collision merges); stage-2 reconciles across channels once a phone/email
appears — e.g. a manager adds a number to a name-only social Person → merges with
the form/call Person sharing it.

## As-built — Phase 5 (in-CRM chat) — LIVE + VERIFIED (2026-06-04)

Managers read & reply to the Chatwoot conversation **inside the CRM** (PRs #3–#12
on `main`, deployed on `crm.enso.ro`). The first cut used an **iframe + SSO** embed
of the Chatwoot dashboard; that worked but showed Chatwoot's whole UI and couldn't
be stripped (no chrome-free URL, cross-origin CSS blocked), so it was **replaced
with a NATIVE chat panel** — our server proxies Chatwoot's REST API (token stays
server-side) and the CRM renders the messages itself. **No iframe, no SSO, no
same-site-cookie dependency** (so `crm.enso.ro` is nice-to-have, not required for
chat; the on-claim push never needed it either).

**Server — `packages/twenty-server/src/modules/enso/chatwoot/`** (`ChatwootModule`
services; `ChatwootApiModule` hosts the controller, imported by `ModulesModule`):
- `ChatwootClientService` — axios over the **Application API** (account token
  `CHATWOOT_API_TOKEN`): agents, conversation meta, messages (read), reply
  (multipart attachments), `assignments`, `canned_responses`, attachment bytes.
  **Platform API** (`CHATWOOT_PLATFORM_TOKEN`): provision users + `GET /users/{id}`
  → the agent's own `access_token` (so replies post **attributed to the manager**).
- `ChatwootConversationResolverService` — DISTINCT conversations on a record (dedup
  by `chatwootConversationId`), **record-agnostic**: an opportunity → that deal's
  chats; a person → all their chats across deals. Enriches each with
  opportunity / project / person names + created date.
- `ChatwootMessagingService` — list/read/reply, per-record authz (the conversation
  must belong to the record), clean channel label, status + dates.
- `ChatwootAssignmentService` — **on-claim push** (wired into the
  `opportunity.updateOne` claim hook): assigns **every** conversation on the deal
  to the owner. **Also resolve-on-close** (`resolveConversationsOnClose`, same
  hook): on `CLOSED_WON`/`CLOSED_LOST` it resolves the deal's Chatwoot
  conversation(s) so re-engagement starts a fresh session — works with all 10
  inboxes set to `lock_to_single_conversation = false` (verified) so the next
  inbound opens a NEW conversation → new activity → new opportunity. Best-effort,
  account-token only.
- `ChatwootAgentProvisioningService` — managers → agents **by email** (D10), JIT +
  bulk. `ChatwootController` (`rest/enso/chatwoot`, all `NoPermissionGuard` except
  `provision-agents` = `WORKSPACE_MEMBERS`): `GET conversations|messages|canned-
  responses|attachment`, `POST reply` (multipart), `POST provision-agents`. All take
  `recordType` (opportunity|person) + `recordId`.

**Frontend** — `ChatwootConversationEmbed` (the stock `IframeWidget` delegates to
it when a widget's `configuration.url` carries the marker
`__enso_chatwoot_conversation` — a valid https URL so it passes the widget config's
`@IsUrl`; the host is never loaded). **Master-detail**: a LIST of the record's
conversations (channel · person, opportunity·project deduped, Open/Resolved status,
created + last-message dates) → click a row → the **thread** (oldest→newest,
`column-reverse` pins newest; `min-height:0` keeps the composer in view) + composer
(reply, emoji, canned responses via `/`, file/image attachments incl.
**drag-and-drop**; images fetched through an authed attachment proxy → object URL).
**Realtime:** subscribes to Chatwoot's ActionCable `RoomChannel` with the agent's
`pubsub_token` (server `GET realtime` mints cable URL + token) and refetches on
`message.*`/`conversation.*` push; polling is the **fallback** (fast 3s while the
socket is down, slow 20s safety net while it's up, gives up reconnecting after 5
tries). ⚠️ Cross-origin cable handshake (`crm.` → `chat.`) depends on Chatwoot's
`allowed_request_origins` accepting the CRM origin — if it doesn't, the socket
fails and the 3s poll carries on (pure enhancement, no regression). Mobile-friendly.

**Live workspace wiring (via page-layout REST API, not seed config):** Conversation
tab on **Opportunity** (layout `5d5457be…`, tab `bb3a88b5…`, widget `7b7e11e6…`)
and **Person** (layout `9f553d90…`, tab `5ea0a406…`, widget `5534ccff…`); icon
`IconMessageCircle`; IFRAME widget `rowSpan 10` (~620px) with the marker URL.

**Env on twenty-server:** `CHATWOOT_BASE_URL`, `CHATWOOT_ACCOUNT_ID`,
`CHATWOOT_API_TOKEN`, `CHATWOOT_PLATFORM_TOKEN` (all set).

**Verified live:** on-claim auto-assign; list→chat on both Opportunity & Person;
text/emoji/attachment replies deliver to the IG/FB thread; inline image render;
status + dates; multi-conversation per deal. Test records cleaned up.

**Lessons (see `docs/PHASE5_GATES.md`):** REST controller guards need their deps in
the controller's own module (boot-crash #3→#4); a fingerprinted/code-split bundle
means "watch the bundle hash flip" to confirm a front deploy; the conversation `id`
from the account API IS the display id used everywhere.

**Deliberately omitted:** Chatwoot assign/resolve/private-notes in the panel
(assignment is CRM-driven; deal stage tracks lifecycle).

**Messaging windows + re-engagement (model):** Meta enforces a **24-hour reply
window** (extended to **7 days** via the human-agent tag) after the contact's last
message on FB/IG; you can **never message first**, and re-opening outside the
window needs message tags or **paid** (sponsored messages) — a later outbound
build. The panel consumes Chatwoot's **`can_reply`** flag (it already encodes the
window incl. human-agent) to gate the composer — we don't reimplement Meta's
policy. **Chatwoot resolve/close is internal only** (NOT synced to Meta; there is
no "close" on a Meta thread) — a new inbound reopens it, or, with the inbox set to
**"lock to single conversation = OFF"**, opens a NEW conversation. Re-engagement
attribution model (decided): **first-touch frozen** on the opportunity forever;
**every re-engagement = its own `inboundActivity`** with its own UTMs; **attach vs
new** = the person×project OPEN-deal dedup (open same-project → attach + update
last-touch + re-notify owner; none open / different project → new opportunity);
**resolve the chat on deal close (won/lost)** so re-engagement starts a fresh
session/deal (linked via `relatedOpportunity`). ⚠️ Capture gap: intake fires on
`conversation_created` only, so mid-OPEN-deal re-engagement in the *same*
conversation isn't captured as a new activity — needs referral-event capture
(Meta sends a fresh `referral` per ad re-click) as a Phase-2 build.

**Phase-5 polish — added (pending live verify):** (0) **reply-window UI** — the
panel gates the composer on Chatwoot `can_reply` (server `getThread` returns
`canReply`+`status`; front disables input + shows a "window closed" notice).
(1) **websocket push** — the
panel now subscribes to Chatwoot ActionCable (`pubsub_token`) with a poll
fallback (server: `ChatwootClientService.websocketUrl`/`getUserPubsubToken`,
`ChatwootMessagingService.getRealtimeCredentials`, `GET rest/enso/chatwoot/realtime`;
front: realtime effect in `ChatwootConversationEmbed`); verify the cross-origin
cable handshake on deploy. (2) **hide-tab-when-no-chat** — the Conversation tab
renders only when the record has a chat (server: `hasConversation` +
`GET has-conversation`; front: `useHasChatwootConversation` filters the tab in
`PageLayoutTabsRenderer`, shown in edit mode + on check error). Done **client-side
via a cheap DB-only presence check**, not a `hasChatwootConversation` field —
simpler, no metadata/migration/pipeline changes.

**Remaining:** App Review for *public* DMs (deferred — tester DMs work today);
attachment thumbnails; a DB-level dedup guard; consent upsert; phone/email dedup
in stage-1 (WhatsApp); possibly a Chatwoot-fork `allowed_request_origins` tweak if
the websocket handshake is rejected cross-origin.
