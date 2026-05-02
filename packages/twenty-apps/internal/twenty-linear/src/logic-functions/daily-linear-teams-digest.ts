import { defineLogicFunction } from 'twenty-sdk/define';

import { DAILY_LINEAR_TEAMS_DIGEST_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { dailyLinearTeamsDigestHandler } from 'src/logic-functions/handlers/daily-linear-teams-digest-handler';

export default defineLogicFunction({
  universalIdentifier: DAILY_LINEAR_TEAMS_DIGEST_UNIVERSAL_IDENTIFIER,
  name: 'daily-linear-teams-digest',
  description:
    'Cron-triggered example showing how to pick a connection without a user context. Counts Linear teams once a day for monitoring.',
  timeoutSeconds: 30,
  handler: dailyLinearTeamsDigestHandler,
  cronTriggerSettings: {
    pattern: '0 8 * * *',
  },
});
