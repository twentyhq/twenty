import { defineApplication } from 'twenty-sdk/define';
import { DEFAULT_ROLE_ID } from 'src/constants/universal-identifiers';

export const APPLICATION_ID = '01113f41-a21b-4449-834f-3a2630a68d62';

export default defineApplication({
  universalIdentifier: APPLICATION_ID,
  displayName: 'Multica Support',
  description: 'Bidirectional support ticket integration between Twenty CRM and Multica. Create and sync tickets with the Support project in the x0 workspace.',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_ID,
  applicationVariables: {
    MULTICA_API_KEY: {
      universalIdentifier: 'f7b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      description: 'Multica Personal Access Token (PAT) for API access to the x0 workspace.',
      value: '',
      isSecret: true,
    },
    MULTICA_WEBHOOK_SECRET: {
      universalIdentifier: 'a8c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      description: 'Shared secret for validating inbound Multica webhook signatures.',
      value: '',
      isSecret: true,
    },
  },
});
