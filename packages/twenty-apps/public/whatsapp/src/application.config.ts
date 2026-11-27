import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CONNECTED_ACCOUNT_PRICE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'WhatsApp',
  description:
    'Your WhatsApp conversations, on the people and companies they are about.',
  logo: 'public/whatsapp-logomark.svg',
  author: 'Twenty',
  category: 'Communication',
  emailSupport: 'contact@twenty.com',
  termsUrl: 'https://github.com/twentyhq/twenty?tab=License-1-ov-file#readme',
  websiteUrl: 'https://www.twenty.com',
  billing: {
    description: '$7 per month per connected WhatsApp account',
    prices: [
      {
        universalIdentifier:
          WHATSAPP_CONNECTED_ACCOUNT_PRICE_UNIVERSAL_IDENTIFIER,
        label: 'Per connected account',
        description: 'Monthly price per connected WhatsApp account',
        type: 'RECURRING',
        billingPeriod: 'MONTHLY',
        amountCents: 700,
        currency: 'USD',
        per: 'CONNECTED_ACCOUNT',
      },
    ],
  },
  serverVariables: {
    UNIPILE_API_KEY: {
      description:
        'Account API key of the Unipile application WhatsApp accounts are connected through (dashboardv2.unipile.com).',
      isSecret: true,
      isRequired: true,
    },
    UNIPILE_WEBHOOK_SECRET: {
      description:
        'Signing secret of the Unipile webhook endpoint pointing at this app.',
      isSecret: true,
      isRequired: true,
    },
  },
});
