import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_CONSTANTS } from 'src/constants/universal-identifiers';

import { postInstallCore } from 'src/logic-functions/handlers/post-install';
import { assertAllWorkflowsSeeded } from 'src/logic-functions/utils/assert-all-workflows-seeded';

const handler = async () => {
  const result = await postInstallCore();

  assertAllWorkflowsSeeded(result);

  return result;
};

export default definePostInstallLogicFunction({
  universalIdentifier:
    PDL_LOGIC_FUNCTION_CONSTANTS.postInstall.universalIdentifier,
  name: 'post-install',
  description:
    'Post-install hook for the People Data Labs app: seeds the enrichment workflows through the core workflow API.',
  timeoutSeconds: 60,
  handler,
  shouldRunSynchronously: true,
});
