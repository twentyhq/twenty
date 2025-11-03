# Changelog

## [0.1.0] - 2024-11-02

### Added
- HMAC SHA-256 signature verification for incoming Fireflies webhooks.
- Fireflies GraphQL client with retry logic, timeout handling, and summary readiness detection.
- Summary-focused meeting processing that extracts action items, sentiment, keywords, and transcript/recording links.
- Scripted custom field provisioning via `yarn setup:fields`.
- Local webhook testing workflow via `yarn test:webhook`.
- Comprehensive Jest suite (15 tests) covering authentication, API integration, summary strategies, and error handling.

### Changed
- Replaced legacy JSON manifests with TypeScript configuration:
  - `application.config.ts` now declares app metadata and configuration variables.
  - `src/objects/meeting.ts` defines the Meeting object via `@ObjectMetadata`.
  - `src/actions/receive-fireflies-notes.ts` exports the Fireflies webhook action plus its runtime config.
- Updated documentation (README, Deployment Guide, Testing) to reflect the new project layout and workflows.
- Switched utility scripts to `tsx` and aligned package management with the hello-world example.

### Fixed
- Resolved real-world Fireflies payload mismatch by adopting the minimal webhook schema.
- Replaced body-based secrets with header-driven HMAC verification.
- Ensured graceful degradation when summaries are pending or Fireflies is temporarily unavailable.

