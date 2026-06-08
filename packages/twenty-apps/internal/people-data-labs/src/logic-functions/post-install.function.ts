import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { postInstallCore } from 'src/logic-functions/handlers/post-install';

const handler = async () => {
  const { seededWorkflows } = await postInstallCore();

  const createdCount = seededWorkflows.filter(
    (workflow) => workflow.status === 'created',
  ).length;

  console.log(
    `[people-data-labs] Post-install seeded ${createdCount} enrichment workflow(s); ${seededWorkflows.length - createdCount} already existed.`,
  );

  return { seededWorkflows };
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
