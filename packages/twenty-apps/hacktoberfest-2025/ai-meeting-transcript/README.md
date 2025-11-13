# AI Meeting Transcript

Automatically process meeting transcripts to extract insights, action items, and follow-ups using AI.

## Features

- **Automatic Transcript Processing**: Receives meeting transcripts via webhook from Granola or similar transcription tools
- **AI-Powered Analysis**: Uses OpenAI to extract:
  - Meeting summary
  - Key discussion points
  - Action items with assignees and due dates
  - Commitments made by participants
- **Rich Note Creation**: Creates formatted notes in Twenty with summary and key points
- **Task Generation**: Automatically creates tasks for action items and commitments, linked to the meeting note

## Requirements

- `twenty-cli` - Install globally: `npm install -g twenty-cli`
- `apiKey` - Go to `https://twenty.com/settings/api-webhooks` to generate one
- `OpenAI API Key` - Get your API key from [OpenAI](https://platform.openai.com/api-keys)

## Installation

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and replace the placeholders:
   - `<SET_YOUR_TWENTY_API>` with your Twenty API key
   - `<SET_YOUR_OPENAI_API_KEY>` with your OpenAI API key

3. Install dependencies:

```bash
yarn install
```

4. Sync the app to your Twenty workspace:

```bash
twenty auth login
twenty app sync
```

## Configuration

After syncing, configure the environment variables in your Twenty workspace:
1. Go to Settings → Apps → AI Meeting Transcript
2. Set the following environment variables:
   - `TWENTY_API_KEY` - Your Twenty API key
   - `TWENTY_API_URL` - Your Twenty instance URL (e.g., `https://api.twenty.com` or `http://localhost:3000` for local development)
   - `OPENAI_API_KEY` - Your OpenAI API key

**Important**: `TWENTY_API_URL` is required and must be set to your Twenty instance URL. For local development, use `http://localhost:3000`. For production, use your actual Twenty instance URL.

## Usage

### Webhook Endpoint

The app exposes a public serverless route trigger.
```
POST /s/webhook/transcript
```

Examples:
- Local: `POST http://localhost:3000/s/webhook/transcript`
- Hosted: `POST https://your-twenty-instance.com/s/webhook/transcript`

### Webhook Payload Format

Send a POST request with the following JSON structure:

```json
{
  "transcript": "Full meeting transcript text here...",
  "meetingTitle": "Q4 Planning Meeting",
  "meetingDate": "2024-01-15",
  "participants": ["John Doe", "Jane Smith"],
  "metadata": {
    "duration": "45 minutes",
    "location": "Conference Room A"
  }
}
```

**Required Fields:**
- `transcript` (string): The full meeting transcript text

**Optional Fields:**
- `meetingTitle` (string): Title of the meeting
- `meetingDate` (string): Date of the meeting (ISO format or readable date)
- `participants` (string[]): List of meeting participants
- `metadata` (object): Additional metadata about the meeting

### Example Webhook Call

```bash
curl -X POST https://your-twenty-instance.com/s/webhook/transcript \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "John: Let'\''s start the meeting. Today we need to discuss Q4 goals. Jane: I agree. We should focus on customer retention. John: Great point. Can you prepare a report by Friday? Jane: Yes, I will have it ready.",
    "meetingTitle": "Q4 Planning Meeting",
    "meetingDate": "2024-01-15"
  }'
```

### What Happens

1. **Transcript Analysis**: The transcript is sent to OpenAI for analysis
2. **Note Creation**: A formatted note is created in Twenty with:
   - Meeting summary
   - Key discussion points
   - Reference to the transcript source
3. **Task Creation**: Tasks are automatically created for:
   - Each action item identified
   - Each commitment made by participants
   - Tasks include a reference to the meeting note ID in their description

## Development

Run dev mode to see application updates on your workspace instantly:

```bash
twenty app dev
```

## Integration with Granola

To integrate with Granola or similar transcription tools:

1. Set up a webhook in your transcription service
2. Configure it to POST to: `https://your-twenty-instance.com/s/webhook/transcript`
3. Map the transcription service's payload format to the expected format above

### Granola Webhook Setup

If using Granola, configure the webhook to send:
- `transcript` field with the transcript text
- Optionally include meeting metadata fields

## API Response

The webhook returns a JSON response:

```json
{
  "success": true,
  "noteId": "uuid-of-created-note",
  "taskIds": ["uuid-of-task-1", "uuid-of-task-2"],
  "summary": {
    "noteCreated": true,
    "tasksCreated": 2,
    "actionItemsProcessed": 1,
    "commitmentsProcessed": 1
  }
}
```
