# Fireflies

Automatically captures meeting notes with AI-generated summaries and insights from Fireflies.ai into your Twenty CRM.

## Integration Overview

**Fireflies webhook → Fireflies API → Twenty CRM with summary-focused insights**

- **Summary-first approach** - Prioritizes action items, keywords, and sentiment over raw transcripts
- **HMAC signature verification** - Secure webhook authentication
- **Two-phase architecture** - Webhook notification → API data fetch → CRM record creation
- **Contact identification** - Matches participants to existing contacts or creates new ones
- **One-on-one meetings** (2 people) → Individual notes linked to each contact
- **Multi-party meetings** (3+ people) → Meeting records with all attendees
- **Business intelligence extraction** - Action items, sentiment scores, topics, meeting types
- **Smart retry logic** - Handles async summary generation with exponential backoff
- **Links transcripts and recordings** - Easy access to full Fireflies content
- **Duplicate prevention** - Checks for existing meetings by title

## What Gets Captured

### Summary & Insights
- **Action Items** - Concrete next steps and commitments
- **Keywords** - Key topics and themes discussed
- **Overview** - Executive summary of the meeting
- **Topics Discussed** - Main discussion points
- **Meeting Type** - Context (sales call, standup, demo, etc.)

### Analytics
- **Sentiment Analysis** - Positive/negative/neutral percentages for deal health
- **Engagement Metrics** - Participation levels (future)

### Resources
- **Transcript Link** - Quick access to full Fireflies transcript
- **Recording Link** - Video/audio recording when available

## Installation

```bash
# Step 1: Authenticate with Twenty
npx twenty-cli auth login

# Step 2: Sync the app to create Meeting object
npx twenty-cli app sync packages/twenty-apps/fireflies

# Step 3: Install dependencies
yarn install

# Step 4: Add custom fields
yarn setup:fields
```

(TODO: change when fields setup internal support)

### What Gets Created

#### Basic Installation (Step 2)
The `app sync` command creates:
- ✅ Meeting object with basic `name` field
- ✅ Webhook endpoint at `/s/webhook/fireflies`

#### After Custom Fields Setup (Step 4)
The `setup:fields` script adds 13 custom fields to store rich Fireflies data:

| Field Name | Type | Label | Description |
|------------|------|-------|-------------|
| `notes` | RICH_TEXT | Meeting Notes | AI-generated summary with overview, topics, action items, and insights |
| `meetingDate` | DATE_TIME | Meeting Date | Date and time when the meeting occurred |
| `duration` | NUMBER | Duration (minutes) | Meeting duration in minutes |
| `meetingType` | TEXT | Meeting Type | Type of meeting (e.g., Sales Call, Sprint Planning, 1:1) |
| `keywords` | TEXT | Keywords | Key topics and themes discussed (comma-separated) |
| `sentimentScore` | NUMBER | Sentiment Score | Overall meeting sentiment (0-1 scale, 1 = most positive) |
| `positivePercent` | NUMBER | Positive % | Percentage of positive sentiment in conversation |
| `negativePercent` | NUMBER | Negative % | Percentage of negative sentiment in conversation |
| `actionItemsCount` | NUMBER | Action Items | Number of action items identified |
| `transcriptUrl` | LINKS | Transcript URL | Link to full transcript in Fireflies |
| `recordingUrl` | LINKS | Recording URL | Link to video/audio recording in Fireflies |
| `firefliesMeetingId` | TEXT | Fireflies Meeting ID | Unique identifier from Fireflies |
| `organizerEmail` | TEXT | Organizer Email | Email address of the meeting organizer |

Then re-sync:
```bash
npx twenty-cli app sync
```

**Note:** Without custom fields, meetings will be created with just the title. The rich summary data will only be stored in Notes for 1-on-1 meetings.

## Configuration

### Required Environment Variables

Check [.env.example](./.env.example)

### Summary Processing Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `immediate_only` | Single fetch attempt, no retries | Fast processing, accept missing summaries if not ready |
| `immediate_with_retry` | Attempts immediate fetch, retries with backoff | **Recommended** - Balances speed and reliability |
| `delayed_polling` | Schedules background polling | For heavily loaded systems |
| `basic_only` | Creates records without waiting for summaries | For basic transcript archival only |

## Webhook Setup

### Step 1: Get Your Webhook URL

Your webhook endpoint will be:
```
https://your-twenty-instance.com/s/webhook/fireflies
```

### Step 2: Configure Fireflies Webhook

1. Log into Fireflies.ai
2. https://app.fireflies.ai/settings#DeveloperSettings
4. Enter your webhook URL
5. Set **Secret**: Generate from there and set value of `FIREFLIES_WEBHOOK_SECRET`
6. Save configuration

### Step 3: Verify Webhook

The integration uses **HMAC SHA-256 signature verification**:
- Fireflies sends `x-hub-signature` header
- Twenty verifies signature using your webhook secret
- Invalid signatures are rejected immediately

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test -- --watch

# Development mode with live sync
npx twenty-cli app dev

# Type checking
npx tsc --noEmit
```

## Testing

The integration includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- fireflies-webhook.spec.ts

# Run with coverage
npm test -- --coverage
```

### Test Coverage

- HMAC signature verification
- Fireflies GraphQL API integration
- Summary processing with retry logic
- Summary-focused CRM record creation
- One-on-one vs multi-party meeting detection
- Contact matching and creation
- Duplicate prevention
- Error handling and resilience

## CRM Record Structure

### One-on-One Meeting Note Example

```markdown
# Meeting: Product Demo with Client (Sales Call)

**Date:** Monday, November 2, 2024, 02:00 PM
**Duration:** 30 minutes
**Participants:** Sarah Sales, John Client

## Overview
Successful product demonstration with positive client feedback.
Client expressed strong interest in the enterprise plan.

## Key Topics
- product features
- pricing discussion
- integration capabilities
- support options

## Action Items
- Follow up with pricing proposal by Friday
- Schedule technical deep-dive next week
- Share case studies from similar clients

## Insights
**Keywords:** product demo, pricing, technical requirements, integration
**Sentiment:** 75% positive, 10% negative, 15% neutral
**Meeting Type:** Sales Call

## Resources
[View Full Transcript](https://app.fireflies.ai/transcript/xxx)
[Watch Recording](https://app.fireflies.ai/recording/xxx)
```

### Multi-Party Meeting Record

- Meeting object with title, date, and all attendees
- Summary stored as meeting notes (structure same as above)
- Action items potentially converted to separate tasks (future)
- Keywords as tags/categories (future)

## Future Implementation Opportunities

### Past Meetings Retrieval
- **New trigger to retrieve past meetings from a contact** - Enable users to fetch historical meeting data from Fireflies for specific contacts, allowing retrospective capture and analysis of past interactions.

Next iteration would enhance the **intelligence layer** to:

### AI-Powered Insights
- **Extract pain points, objections & buying signals** automatically from transcripts
- **Calculate deal health scores** based on conversation sentiment trends
- **Auto-create contextualized tasks** with AI-suggested next steps and priorities
- **Proactively flag at-risk deals** when negative signals appear
- **Track conversation patterns** that correlate with deal success

### Enhanced Analytics
- **Action item completion tracking** across deals
- **Sentiment trend analysis** over time for account health
- **Speaking time analysis** for meeting engagement insights
- **Topic clustering** for product/feature interest patterns

### Workflow Automation
- **Auto-assign follow-up tasks** based on action items
- **Smart notifications** for urgent follow-ups
- **Deal stage progression** based on meeting outcomes
- **Competitive intelligence** extraction from conversations

**Integration**: Fireflies webhook → AI processing layer → Enhanced Twenty records

*This would require the current MVP to be stabilized and discussions about intelligence layer architecture and data privacy considerations.*

