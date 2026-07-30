# Changelog

## 1.2.0

- Compute last contact on Companies and Opportunities when the record or its relationships change, not only on new interactions: opportunities recompute from their point of contact on creation and when it changes, and companies recompute from their people on creation and when a person joins or leaves.

## 1.1.3

- Stop declaring INDEX view fields explicitly: the server now provisions the INDEX view column for each app field automatically, so the manifest no longer targets the engine-owned standard INDEX views.

## 1.1.1

- Throttle backfill updates and retry rate-limited or transient API failures with exponential backoff, so install/upgrade no longer fails behind Cloudflare rate limiting.

## 1.1.0

- Add last contact on Companies and Opportunities.
- Set last-contact fields readonly.

## 1.0.0

- Initial release: "Last contact by" and "Last contact item" tracking on People, powered by calendar and message sync.
