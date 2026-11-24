import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';

import { WHATSAPP_HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const whatsappHealthCheckHandler =
  async (): Promise<ApplicationHealthCheckResult> => ({
    status: 'INFO',
    title: 'Each member connects their own WhatsApp account',
    description:
      'Connect WhatsApp from your app preferences to bring your WhatsApp conversations into Twenty.',
    action: {
      label: 'Open app preferences',
      location: `/settings/accounts/applications/${process.env.APPLICATION_ID}`,
    },
  });

export default defineHealthCheck({
  universalIdentifier: WHATSAPP_HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-health-check',
  description:
    'Points members to their app preferences, where each one connects their own WhatsApp account.',
  timeoutSeconds: 10,
  handler: whatsappHealthCheckHandler,
});
