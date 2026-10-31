import { defineAgent } from 'twenty-sdk/define';

import {
  GRANT_DEMO_AGENT_UNIVERSAL_IDENTIFIER,
  REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Points at the requested role, so it runs with the app's grant
export default defineAgent({
  universalIdentifier: GRANT_DEMO_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'grant-demo-agent',
  label: 'Grant demo agent',
  description: 'Answers questions about the records the Grant demo app can see',
  icon: 'IconRobot',
  prompt:
    'You help users explore the records available to the Grant demo app. Use your tools to look records up.',
  roleUniversalIdentifier: REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
});
