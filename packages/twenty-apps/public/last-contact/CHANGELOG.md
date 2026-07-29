# Changelog

## 1.1.3

- Batch the backfill's writes with `createMany` upserts, read message senders and calendar organizers from the participant pages already being paged, and skip records that already hold the value being written. Large workspaces no longer exhaust the application API rate limit during install or upgrade.

## 1.1.1

- Throttle backfill updates and retry rate-limited or transient API failures with exponential backoff, so install/upgrade no longer fails behind Cloudflare rate limiting.

## 1.1.0

- Add last contact on Companies and Opportunities.
- Set last-contact fields readonly.

## 1.0.0

- Initial release: "Last contact by" and "Last contact item" tracking on People, powered by calendar and message sync.
