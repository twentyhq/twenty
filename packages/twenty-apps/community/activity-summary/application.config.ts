import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: 'b53627f5-ca60-478c-bc43-c7ab4904e34a',
  displayName: 'Activity Summary',
  description:
    'A TypeScript-based reporting bot that summarizes activity from your Twenty CRM workspace and sends daily/periodic reports to Slack, Discord, and WhatsApp. Meet Kylian Mbaguette, your friendly CRM activity reporter!',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: '304b7d5d-e2bb-4444-9b04-6b3ae8b73730',
      description: 'Twenty API Key',
      isSecret: true,
    },
    DAYS_AGO: {
      universalIdentifier: '040a3097-9cee-4f74-b957-c2f9bf636c3f',
      description:
        'How far back into the past we want to summarise – defaults to the past 7 days',
      value: '7',
      isSecret: false,
    },
    SLACK_HOOK_URL: {
      universalIdentifier: 'fd16e370-934c-4267-83b4-7d88259bf7e1',
      description: 'Slack hook URL for sending message to channel',
      isSecret: true,
    },
    DISCORD_WEBHOOK_URL: {
      universalIdentifier: 'f3741075-d525-4988-ba42-55d519c6fd76',
      description:
        'Discord webhook URL for sending message to channel of a server',
      isSecret: true,
    },
    FB_GRAPH_TOKEN: {
      universalIdentifier: 'fb907f49-74ac-4aa5-ba45-cfc9250ecc44',
      description: 'For Facebook auth',
      isSecret: true,
    },
    WHATSAPP_RECIPIENT_PHONE_NUMBER: {
      universalIdentifier: 'c856ee5d-44bf-42f4-9a39-2553a94af518',
      description: 'Phone number for receiving WhatsApp message',
      isSecret: true,
    },
  },
};

export default config;
