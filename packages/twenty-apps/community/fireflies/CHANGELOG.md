# Changelog

## [0.3.1] - 2025-12-08

Import all

### Added
- Historical import CLI: `yarn meeting:all` to fetch and insert historical Fireflies meetings with filters (date range, organizers, participants, channel, mine) and dry-run support.
- Fireflies transcripts listing with pagination and date filtering to support bulk imports.

### Changed
- Deduplication now checks `firefliesMeetingId` before creating meetings (webhook + bulk).
- Shared historical importer pipeline reusing existing note/meeting formatting.

## [0.3.0] - 2025-12-08

Subscription-based query / Full transcript and AI notes for Pro+ / More

### Added
- **Full transcript capture**: Meeting object now stores the complete meeting transcript with speaker names and timestamps (`transcript` field)
- **Rich AI meeting notes**: Captures detailed AI-generated meeting notes from Fireflies (`notes` field with 7,000+ char summaries)
- **Expanded summary fields**: Now fetches all available Fireflies summary data:
  - `notes` - Detailed AI-generated meeting notes with timestamps and section headers
  - `bullet_gist` - Emoji-enhanced bullet point summaries
  - `outline` / `shorthand_bullet` - Timestamped meeting outline
  - `gist` - One-sentence meeting summary
  - `short_summary` - Single paragraph summary
  - `short_overview` - Brief overview
- **New Meeting fields**:
  - `transcript` - Full meeting transcript with speaker attribution
  - `notes` - AI-generated detailed notes
  - `audioUrl` - Link to audio recording (Pro+)
  - `videoUrl` - Link to video recording (Business+)
  - `meetingLink` - Original meeting link
  - `neutralPercent` - Neutral sentiment percentage
- **Meeting delete utility**: New `yarn meeting:delete <meetingId>` script for cleanup and re-import
- **Debug meeting utility**: New `scripts/debug-meeting.ts` to inspect raw Fireflies API responses

### Changed
- **Plan-based GraphQL queries**: Completely redesigned query system with three tiers:
  - **Free**: Basic fields only (title, date, duration, participants, transcript_url, meeting_link)
  - **Pro**: Adds full transcript (`sentences`), summary fields, speakers, audio_url
  - **Business+**: Adds analytics, video_url, speaker stats, meeting metrics
- **Action items parsing**: Fixed parsing of `action_items` which Fireflies returns as newline-separated string, not array
- **Note body format**: Enhanced with Meeting Notes, Outline, Key Points sections from rich Fireflies data
- **Import status**: Added `PARTIAL` status for imports missing summary/analytics data

### Fixed
- Missing `notes` and `bullet_gist` fields in data transform (were fetched but not passed through)
- Proper fallback: Uses `shorthand_bullet` when `outline` is empty (Fireflies stores outline content there)
- Summary readiness detection now checks `notes` field in addition to `overview` and `action_items`

### Documentation
- Updated README with complete API access comparison table by subscription plan
- Documented all available Fireflies summary fields and their plan requirements

## [0.2.3] - 2025-12-06

### Added
- **Meeting ingest utility**: New `yarn meeting:ingest <meetingId>` script to manually fetch and import specific Fireflies meetings into Twenty
- **Plan-based field selection**: Added `FIREFLIES_PLAN` configuration to control which GraphQL fields are requested based on subscription level (free, pro, business, enterprise)
- **Main entry point**: New `src/index.ts` centralizing all exports for cleaner imports

### Changed
- **Auth configuration**: Disabled authentication requirement for webhook route (`isAuthRequired: false`) to support serverless deployments
- **Signature verification fallback**: Webhook handler now supports signature in payload body as fallback when HTTP headers aren't forwarded to serverless functions (production doesn't work for Fireflies webhook)
- **Improved type safety**: Replaced `any` types with proper TypeScript types throughout codebase

### Enhanced
- **Webhook debugging**: Added detailed debug output including param keys, header info, and signature comparison details
- **Test webhook script**: Includes signature in both header and payload, with diagnostic output for header forwarding status
- **Documentation**: Added README sections on current twenty headers forward limitations and utility scripts

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

