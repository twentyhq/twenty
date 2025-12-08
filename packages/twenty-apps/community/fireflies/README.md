# Fireflies

Automatically captures meeting notes with AI-generated summaries and insights from Fireflies.ai into your Twenty CRM.

### Current Status
- Doesn't work with Fireflies webhook yet due to missing headers forwarding in twenty serverless func
- Meeting ingestion utility scripts are available for individual meeting insertion and historical meetings with filters with yarn meeting:all

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

## API Access by Subscription Plan

Fireflies API access varies by subscription tier. This integration automatically adapts queries based on your plan and falls back gracefully if restrictions are encountered.

### Plan Comparison

| Feature | Free | Pro | Business | Enterprise |
|---------|:----:|:---:|:--------:|:----------:|
| **API Rate Limit** | 50/day | 50/day | 60/min | 60/min |
| **Basic Data** (title, date, duration) | ✅ | ✅ | ✅ | ✅ |
| **Participants List** | ✅ | ✅ | ✅ | ✅ |
| **Transcript URL** | ✅ | ✅ | ✅ | ✅ |
| **Speakers** | ❌ | ✅ | ✅ | ✅ |
| **Summary** (overview, keywords) | ❌ | ✅ | ✅ | ✅ |
| **Audio URL** | ❌ | ✅ | ✅ | ✅ |
| **Action Items** | ❌ | ❌ | ✅ | ✅ |
| **Topics Discussed** | ❌ | ❌ | ✅ | ✅ |
| **Video URL** | ❌ | ❌ | ✅ | ✅ |
| **Sentiment Analytics** | ❌ | ❌ | ✅ | ✅ |
| **Meeting Attendees (detailed)** | ❌ | ❌ | ✅ | ✅ |

### What You'll Get Per Plan

**Free Plan:**
- Meeting title, date, duration
- Participant names/emails (basic)
- Link to transcript

**Pro Plan:**
- Everything in Free, plus:
- Speaker identification
- AI summary (overview + keywords)
- Audio recording URL

**Business Plan:**
- Everything in Pro, plus:
- Action items extraction
- Topics discussed
- Sentiment analysis (positive/negative/neutral %)
- Video recording URL
- Detailed meeting attendee info

### Configuration

Set your plan in `.env`:
```bash
FIREFLIES_PLAN=free  # Options: free, pro, business, enterprise
```

**Rate Limiting:** Free/Pro plans are limited to 50 API calls/day. The integration uses conservative retry settings by default to stay within limits.

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

## Quick Start

### Installation

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

### Configuration

⚠️ **Important**: The integration uses **conservative retry settings** to respect Fireflies' 50 requests/day API limit with free/pro plans. You may increase for more reactivity with higher plans.

**Required Environment Variables:**
```bash
FIREFLIES_API_KEY=your_api_key          # From Fireflies settings
TWENTY_API_KEY=your_api_key             # From Twenty CRM settings
SERVER_URL=https://your-domain.twenty.com
```

**Optional (Recommended):**
```bash
FIREFLIES_WEBHOOK_SECRET=your_secret    # For webhook security
```

📖 **For detailed configuration, troubleshooting, and rate limit management**, see [WEBHOOK_CONFIGURATION.md](./WEBHOOK_CONFIGURATION.md)

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

### Current Platform Limitation (Headers)

- Twenty serverless route triggers currently do **not forward HTTP headers** to functions. Fireflies signatures sent in headers are stripped, so header-based verification does not work in production.
- Workaround: the provided test script also includes the signature inside the payload; the handler falls back to that payload signature. Use this only for testing until header forwarding is supported.

## Utilities for meeting insertion (workarounds)

- Ingest a specific Fireflies meeting into Twenty:
`yarn meeting:ingest <meetingId>` or `MEETING_ID=... yarn meeting:ingest`

- Fetch all/historical Fireflies meetings into Twenty:
`yarn meeting:all [--from 2024-01-01] [--to 2024-02-01] [--organizer a@x.com] [--participant b@x.com] [--channel <channelId>] [--mine] [--dry-run]`

  - Filters (combine as needed):
    - `--from` / `--to`: ISO or date string range filter
    - `--organizer` / `--participant`: comma-separated emails
    - `--channel`: Fireflies channel id
    - `--mine`: only meetings for the current Fireflies user
  - Controls:
    - `--dry-run`: list and transform without writing to Twenty
    - `--page-size`: pagination size (default 50)
    - `--max-records`: stop after N transcripts (default 500)

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

Next iterations would enhance the **intelligence layer** to:

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

