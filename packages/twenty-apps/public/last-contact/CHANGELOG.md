# Changelog

## 1.2.0

- Track email and calendar participants that are created already linked to a person, which previously emitted no personId update and were silently skipped.
- Recompute an opportunity's last contact when its point of contact is set, changed or cleared.

## 1.1.1

- Throttle backfill updates and retry rate-limited or transient API failures with exponential backoff, so install/upgrade no longer fails behind Cloudflare rate limiting.

## 1.1.0

- Add last contact on Companies and Opportunities.
- Set last-contact fields readonly.

## 1.0.0

- Initial release: "Last contact by" and "Last contact item" tracking on People, powered by calendar and message sync.
