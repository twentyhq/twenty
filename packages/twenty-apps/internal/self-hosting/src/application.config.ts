import { defineApplication } from 'twenty-sdk';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export default defineApplication({
  universalIdentifier: '94f7db30-59e5-4b09-a5fe-64cd3d4a65b0',
  displayName: 'Self Hosting',
  description: 'Used to manage billing and telemetry of self-hosted instances',
  defaultRoleUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.roles.defaultRole.universalIdentifier,
});
