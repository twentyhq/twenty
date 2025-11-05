# Twenty CRM Activity Reporter ��

A TypeScript-based reporting bot that summarizes activity from your Twenty CRM workspace and sends daily/periodic reports to Slack, Discord, and WhatsApp. Meet Kylian Mbaguette, your friendly CRM activity reporter!

## Features

- 🧑‍💻 **People & Company Tracking**: Summarizes newly created people and companies
- 🎯 **Opportunity Monitoring**: Reports on new opportunities created, broken down by stage
- ✅ **Task Analytics**:
  - Tracks task creation
  - Calculates on-time completion rates
  - Identifies team members with the most overdue tasks (the "slackers")
- 🔔 **Multi-Platform Notifications**: Send reports to Slack, Discord, and/or WhatsApp
- ⏰ **Configurable Time Range**: Look back any number of days

## Prerequisites

- Node.js (v14 or higher recommended)
- TypeScript
- A [Twenty CRM](https://twenty.com) account with API access
- Optional: Slack webhook, Discord webhook, and/or WhatsApp Business API access

## Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd <project-directory>

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:
```bash
# Required
TWENTY_API_KEY=your_twenty_api_key_here
DAYS_AGO=7  # Number of days to look back

# Optional - Include only the platforms you want to use
SLACK_HOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
FB_GRAPH_TOKEN=your_facebook_graph_api_token
WHATSAPP_RECIPIENT_PHONE_NUMBER=+1234567890
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWENTY_API_KEY` | ✅ Yes | Your Twenty CRM API key |
| `DAYS_AGO` | ✅ Yes | Number of days to look back for the report |
| `SLACK_HOOK_URL` | ❌ No | Slack incoming webhook URL |
| `DISCORD_WEBHOOK_URL` | ❌ No | Discord webhook URL |
| `FB_GRAPH_TOKEN` | ❌ No | Facebook Graph API token for WhatsApp |
| `WHATSAPP_RECIPIENT_PHONE_NUMBER` | ❌ No | WhatsApp recipient phone number (with country code) |

## Usage
```bash
# Run the application
npm start
# or
node dist/index.js  # if compiled

# For development
npm run dev  # if you have ts-node configured
```

## Project Structure
```
.
├── index.ts                              # Main entry point
├── people-creation-summariser.ts         # Summarizes people/company creation
├── opportunity-creation-summariser.ts    # Summarizes opportunity creation
├── task-creation-summariser.ts           # Summarizes task creation & completion
├── senders.ts                            # Handles sending to Slack/Discord/WhatsApp
├── utils.ts                              # API request utility
└── README.md
```

## How It Works

1. **Data Collection**: The bot queries the Twenty CRM API for activities within the specified time range
2. **Analysis**:
   - Counts new people and companies
   - Categorizes opportunities by stage
   - Calculates task completion rates and identifies overdue tasks
3. **Reporting**: Formats the data into friendly messages
4. **Distribution**: Sends reports to configured platforms (Slack, Discord, WhatsApp)

## Report Format

Each report includes:
```
Bonjour! 🥖 Je m'appelle Kylian Mbaguette. Over the last X days:

🧑‍💻 People & Companies
- X People and Y Companies were added

🎯 Opportunities
- X Opportunities were added: Y in NEW, Z in PROPOSAL

📋 Tasks
- X Tasks were created
- Y% Tasks were completed on time
- [Name] slacked the most with Z Tasks overdue
```

## API Integration

This bot uses the [Twenty CRM REST API](https://api.twenty.com/rest/). The following endpoints are used:

- `GET /people` - Fetch people data
- `GET /companies` - Fetch company data
- `GET /opportunities` - Fetch opportunity data
- `GET /tasks` - Fetch task data
- `GET /workspaceMembers/{id}` - Fetch workspace member details

## Development
```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Run in development mode
npx ts-node index.ts
```

## Notes

- The "slacker" detection is lighthearted and identifies team members with the most overdue tasks
- At least one messaging platform must be configured for the bot to send reports
- The bot uses ISO date format (YYYY-MM-DD) for date filtering
- Task completion percentage only considers incomplete tasks (excludes already completed tasks from the calculation)

## Troubleshooting

**Issue**: No messages being sent
- **Solution**: Ensure at least one messaging platform is configured with valid credentials

**Issue**: API authentication errors
- **Solution**: Verify your `TWENTY_API_KEY` is correct and has necessary permissions

**Issue**: WhatsApp messages not sending
- **Solution**: Ensure both `FB_GRAPH_TOKEN` and `WHATSAPP_RECIPIENT_PHONE_NUMBER` are set correctly

## Contributing
Built with ❤️ and 🥖 by Azmat, Ali and Mike from 9dots
