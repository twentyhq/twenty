import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

const handler = async () => {
  return { seededWorkflows: [] };
};

export default definePostInstallLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.postInstall,
  name: 'post-install',
  description:
    'Seeds the default People Data Labs enrichment workflows on install.',
  timeoutSeconds: 30,
  handler,
  shouldRunSynchronously: true,
});
