# Fireflies

Automatically captures meeting notes and transcripts from Fireflies.ai into your Twenty CRM.

## Features

- **Auto-creates contacts** for unknown meeting participants
- **Creates meeting records** for multi-participant calls (3+ people)
- **Creates individual notes** for one-on-one meetings (2 people)
- **Links transcripts and recordings** from Fireflies
- **Prevents duplicates** by checking existing meetings

## Installation

```bash
npx twenty-cli auth login
npx twenty-cli app sync
```

## Configuration

Set up your environment variables in `.env`:

```env
FIREFLIES_WEBHOOK_SECRET=your_secure_secret_here
AUTO_CREATE_CONTACTS=true
TWENTY_API_KEY=your_twenty_api_key
SERVER_URL=http://localhost:3000
```

## Webhook Setup

Configure Fireflies to send webhooks to:
```
POST [YOUR_TWENTY_URL]/webhooks/fireflies
```

## Development

```bash
# Run tests
npm test

# Development mode with live sync
npx twenty-cli app dev
```

## Testing

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```