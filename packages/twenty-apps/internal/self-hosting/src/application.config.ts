import { defineApplication } from 'twenty-sdk/define';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '94f7db30-59e5-4b09-a5fe-64cd3d4a65b0';

export default defineApplication({
  universalIdentifier: '94f7db30-59e5-4b09-a5fe-64cd3d4a65b0',
  displayName: 'Self Hosting',
  description: 'Used to manage billing and telemetry of self-hosted instances',
  defaultRoleUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.roles.defaultRole.universalIdentifier,
});
