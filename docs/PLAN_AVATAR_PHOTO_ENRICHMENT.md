# Plan: Avatar Photo Enrichment

**Status:** Research complete — pending client discussion before implementation

---

## Goal

Auto-populate the `avatarUrl` field on Person records in Twenty CRM using a third-party enrichment service, sourcing profile photos from LinkedIn or other data sources.

---

## Research Findings (April 2026)

### Dead / Unusable Services

| Service | Reason |
|---|---|
| Proxycurl | Shut down July 2026 (LinkedIn lawsuit) |
| Clearbit | Dead for free use since April 2025 (absorbed into HubSpot paid plans) |
| People Data Labs | No photo fields in their schema at all |
| Apollo.io | Enrichment API locked behind $79/mo plan |
| Hunter.io | Avatar field exists but almost always returns `null` |
| RocketReach / ContactOut | API requires $200+/mo plans |

### Free Options

**Gravatar**
- Genuinely free, no rate limits on avatar requests, 1,000 profile API lookups/hr with a free key
- Input: email (SHA256-hashed)
- Returns stable, permanent `gravatar.com` URLs — never expire
- Coverage: ~70M users, mostly developers/bloggers. Hit rate for B2B contacts (finance, sales) estimated 5–15%
- Worth implementing as a zero-cost first pass

**Piloterr**
- 50 one-time credits on signup (not monthly recurring)
- Input: LinkedIn URL
- Returns `photo_url` — but **expires after 30 minutes**; image must be downloaded and re-hosted immediately
- Adds significant pipeline complexity; not a "store the URL" solution

### Cheapest Paid Option

**Enrich.so**
- Pay-as-you-go at **$0.20/lookup**, no subscription required
- Input: email (`Email to Person Lite` endpoint) or LinkedIn URL (`LinkedIn Public Profile` endpoint)
- Returns `photo_url` / `profile_picture`
- At a few hundred contacts/month ≈ $20–60/month
- REST API, clean documentation

### Critical Caveat on All Services

Even where services return a photo URL, it is usually a **LinkedIn CDN URL** (`media.licdn.com/...`) which can expire. Best practice is to **download the image at enrichment time and store it in Twenty's file storage** (using the `avatarFile` field), then save the internal URL in the record — not the LinkedIn CDN URL directly.

---

## Proposed Implementation Approach (outline, not approved)

1. **Gravatar lookup first** — free, for any Person with an email address
2. **Enrich.so as paid fallback** — if Gravatar misses and a LinkedIn URL is present on the record
3. **Download-and-store pipeline** — any returned photo URL is fetched server-side and stored via Twenty's file API; the resulting internal URL is written to `avatarFile`
4. **Trigger** — on Person record create/update (webhook or Twenty workflow), or as a manual bulk enrichment command

---

## Open Questions

- Client budget: is ~$20–60/month for Enrich.so acceptable?
- Acceptable hit rate if Gravatar-only (free)?
- Trigger preference: automatic on record creation, or manual bulk action?
- Should existing records be back-filled, or new records only?
