import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

const handler = async () => {
  return { seededWorkflows: [] };
};

export default definePostInstallLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.postInstall,
  name: 'post-install',
  description:
    'Post-install hook for the People Data Labs app (workflow seeding is not currently wired up).',
  timeoutSeconds: 30,
  handler,
  shouldRunSynchronously: true,
});
