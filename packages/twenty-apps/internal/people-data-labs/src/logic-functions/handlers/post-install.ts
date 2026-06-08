import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { ENRICHMENT_WORKFLOW_SEEDS } from 'src/constants/enrichment-workflow-seeds';
import { resolveLogicFunctionId } from 'src/logic-functions/utils/resolve-logic-function-id';
import { seedEnrichmentWorkflow } from 'src/logic-functions/utils/seed-enrichment-workflow';
import { type PostInstallResult } from 'src/types/post-install-result';
import { type SeedEnrichmentWorkflowResult } from 'src/types/seed-enrichment-workflow-result';
import { isDefined } from 'src/utils/is-defined';

export const postInstallCore = async ({
  coreClient = new CoreApiClient(),
  metadataClient = new MetadataApiClient(),
}: {
  coreClient?: CoreApiClient;
  metadataClient?: MetadataApiClient;
} = {}): Promise<PostInstallResult> => {
  const { findManyLogicFunctions: logicFunctions } = await metadataClient.query(
    {
      findManyLogicFunctions: {
        id: true,
        universalIdentifier: true,
      },
    },
  );

  const seededWorkflows: SeedEnrichmentWorkflowResult[] = [];

  for (const seed of ENRICHMENT_WORKFLOW_SEEDS) {
    const logicFunctionId = resolveLogicFunctionId({
      logicFunctions,
      universalIdentifier: seed.logicFunctionUniversalIdentifier,
    });

    if (!isDefined(logicFunctionId)) {
      console.warn(
        `[people-data-labs] Skipping "${seed.workflowName}": logic function ${seed.logicFunctionUniversalIdentifier} is not installed.`,
      );
      continue;
    }

    try {
      const result = await seedEnrichmentWorkflow({
        client: coreClient,
        logicFunctionId,
        seed,
      });

      seededWorkflows.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.warn(
        `[people-data-labs] Failed to seed "${seed.workflowName}": ${message}`,
      );

      seededWorkflows.push({
        objectNameSingular: seed.objectNameSingular,
        workflowName: seed.workflowName,
        status: 'failed',
        error: message,
      });
    }
  }

  return { seededWorkflows };
};
