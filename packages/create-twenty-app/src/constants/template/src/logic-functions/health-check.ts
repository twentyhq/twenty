import { defineHealthCheck } from 'twenty-sdk/define';

import { HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'health-check',
  handler: async () => {
    return { status: 'ok' };
  },
});
