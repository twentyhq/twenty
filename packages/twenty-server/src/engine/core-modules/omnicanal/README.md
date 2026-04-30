# Omnichannel Engagement

Multi-channel outreach with WhatsApp, SMS, unified inbox, and multi-step sequence automation with enrollment tracking.

## Entities
- `WhatsAppEntity` — WhatsApp message and configuration
- `SMSEntity` — SMS message tracking
- `UnifiedInboxEntity` — consolidated inbox across channels
- `SequenceEntity` — multi-step engagement sequence definition
- `SequenceEnrollmentEntity` — contact enrollment in sequences

## Services
- `WhatsAppService` — sends/receives WhatsApp messages via API
- `UnifiedInboxService` — aggregates messages across email, WhatsApp, SMS, chat
- `SequenceService` — creates and manages outreach sequences
- `SequenceExecutorService` — executes sequence steps on schedule

## REST Endpoints
- Omnichannel controller for webhook integrations (WhatsApp/SMS callbacks)

## Feature Flag
N/A (core engagement module)

## Dependencies
- None
