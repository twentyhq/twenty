import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';

import { LINKEDIN_HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const linkedinHealthCheckHandler =
  async (): Promise<ApplicationHealthCheckResult> => ({
    status: 'INFO',
    title: 'Each member connects their own LinkedIn account',
    description:
      'Connect LinkedIn from your app preferences to bring your LinkedIn conversations into Twenty.',
    action: {
      label: 'Open app preferences',
      location: `/settings/accounts/applications/${process.env.APPLICATION_ID}`,
    },
  });

export default defineHealthCheck({
  universalIdentifier: LINKEDIN_HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-health-check',
  description:
    'Points members to their app preferences, where each one connects their own LinkedIn account.',
  timeoutSeconds: 10,
  handler: linkedinHealthCheckHandler,
});
