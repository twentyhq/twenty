# Changelog

## [0.2.2] - 2025-11-04

### Added
- **Enhanced logging system**: Introduced configurable `AppLogger` class with log level support (debug, info, warn, error, silent)
  - Environment-based log level configuration via `LOG_LEVEL` environment variable
  - Test environment detection to prevent log noise during testing
  - Context-aware logging with proper prefixes for better debugging
- **Improved error handling**: Enhanced webhook signature verification with detailed debug logging
- **Better debugging capabilities**: Added comprehensive logging throughout webhook processing pipeline

### Enhanced
- **Webhook signature verification**: Improved signature validation with detailed logging for troubleshooting
- **Error messages**: More descriptive error logging for failed operations and security violations
- **Development experience**: Better debugging information for webhook processing and API interactions


## [0.2.1] - 2025-11-03

### Added
- **Import status tracking**: Added four new meeting fields to track import status and failure handling:
  - `importStatus` (SELECT) - Tracks SUCCESS, FAILED, PENDING, RETRYING states
  - `importError` (TEXT) - Stores error messages when imports fail
  - `lastImportAttempt` (DATE_TIME) - Timestamp of the last import attempt
  - `importAttempts` (NUMBER) - Counter for number of import attempts
- **Automatic failure tracking**: Enhanced webhook handler to automatically create failed meeting records when processing fails
- **Failed meeting formatter**: Added `toFailedMeetingCreateInput()` method to create standardized failed meeting records

### Enhanced
- **Meeting type definition**: Extended `MeetingCreateInput` type with import tracking fields
- **Success status tracking**: Successful meeting imports now automatically set `importStatus: 'SUCCESS'` and track timestamps
- **Error handling**: Webhook processing failures are now captured and stored as meeting records for visibility and potential retry

## [0.2.0] - 2025-11-03

### Changed
- **Major refactoring**: Split monolithic `receive-fireflies-notes.ts` into modular architecture:
  - `fireflies-api-client.ts` - Fireflies GraphQL API integration with retry logic
  - `twenty-crm-service.ts` - Twenty CRM operations (contacts, notes, meetings)
  - `formatters.ts` - Meeting and note body formatting
  - `webhook-handler.ts` - Main webhook orchestration
  - `webhook-validator.ts` - HMAC signature verification
  - `utils.ts` - Shared utility functions
  - `types.ts` - Centralized type definitions
- **Schema update**: Changed Meeting `notes` field from `RICH_TEXT` to `RELATION` type linking to Note object
- Enhanced participant extraction from multiple Fireflies API data sources (participants, meeting_attendees, speakers, meeting_attendance)
- Improved organizer email matching with name-based heuristics
- Updated note creation to use `bodyV2.markdown` format instead of legacy `body` field
- Modernized Meeting object schema with proper link field types for transcriptUrl and recordingUrl
- Enhanced test suite with improved mocking for new modular structure
- **Configuration optimization**: Reduced default retry attempts from 30 to 5 with increased delay (120s) to better respect Fireflies API rate limits (50 requests/day for free/pro plans)
- Updated field setup script to support relation field creation with Note object
- Restructured exports: types now exported from `types.ts`, runtime functions from `index.ts`
- Updated import paths in action handlers to use centralized index exports
- Added TypeScript path mappings for `twenty-sdk` in workspace configuration

### Added
- `createNoteTarget` method for linking notes to multiple participants
- Support for extracting participants from extended Fireflies API response formats
- Better organizer identification logic matching email usernames to speaker names
- `axios` dependency for improved HTTP client capabilities
- API subscription plan documentation highlighting rate limit differences (50/day vs 60/minute)
- Enhanced README with rate limiting guidance and configuration documentation
- Relation field creation support in field provisioning script

### Fixed
- Note linking now properly associates a single note with multiple participants in 1:1 meetings
- Participant extraction handles missing email addresses gracefully
- Improved handling of various Fireflies participant data structures
- Test mocks updated to use string format for participants (`"Name <email>"`) matching Fireflies API response format
- Test assertions updated to validate `bodyV2.markdown` instead of deprecated `body` field

## [0.1.0] - 2025-11-02

### Added
- HMAC SHA-256 signature verification for incoming Fireflies webhooks
- Fireflies GraphQL client with retry logic, timeout handling, and summary readiness detection
- Summary-focused meeting processing that extracts action items, sentiment, keywords, and transcript/recording links
- Scripted custom field provisioning via `yarn setup:fields`
- Local webhook testing workflow via `yarn test:webhook`
- Comprehensive Jest suite (15 tests) covering authentication, API integration, summary strategies, and error handling

### Changed
- Replaced legacy JSON manifests with TypeScript configuration:
  - `application.config.ts` now declares app metadata and configuration variables
  - `src/objects/meeting.ts` defines the Meeting object via `@ObjectMetadata`
  - `src/actions/receive-fireflies-notes.ts` exports the Fireflies webhook action plus its runtime config
- Updated documentation (README, Deployment Guide, Testing) to reflect the new project layout and workflows
- Switched utility scripts to `tsx` and aligned package management with the hello-world example

### Fixed
- Resolved real-world Fireflies payload mismatch by adopting the minimal webhook schema
- Replaced body-based secrets with header-driven HMAC verification
- Ensured graceful degradation when summaries are pending or Fireflies is temporarily unavailable

