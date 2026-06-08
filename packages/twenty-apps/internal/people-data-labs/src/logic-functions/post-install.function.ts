import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { postInstallCore } from 'src/logic-functions/handlers/post-install';
import { type SeedEnrichmentWorkflowResult } from 'src/types/seed-enrichment-workflow-result';

const handler = async () => {
  const { seededWorkflows } = await postInstallCore();

  const countByStatus = (status: SeedEnrichmentWorkflowResult['status']) =>
    seededWorkflows.filter((workflow) => workflow.status === status).length;

  console.log(
    `[people-data-labs] Post-install seeded ${countByStatus('created')} enrichment workflow(s); ${countByStatus('skipped')} already existed; ${countByStatus('failed')} failed.`,
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
