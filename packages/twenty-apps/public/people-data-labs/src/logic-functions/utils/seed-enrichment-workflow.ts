import { type CoreApiClient } from 'twenty-client-sdk/core';

import { PdlOperationError } from 'src/logic-functions/errors/pdl-operation-error';
import { buildBulkRecordsTrigger } from 'src/logic-functions/utils/build-bulk-records-trigger';
import { buildLogicFunctionStep } from 'src/logic-functions/utils/build-logic-function-step';
import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionLogicFunctionStep,
  queryCoreWorkflowVersions,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'src/logic-functions/utils/core-workflow-operations';
import { findExistingCoreWorkflowId } from 'src/logic-functions/utils/find-existing-core-workflow-id';
import { type EnrichmentWorkflowSeed } from 'src/types/enrichment-workflow-seed';
import { type SeedEnrichmentWorkflowResult } from 'src/types/seed-enrichment-workflow-result';
import { isDefined } from 'src/utils/is-defined';

const TRIGGER_STEP_ID = 'trigger';

export const seedEnrichmentWorkflow = async ({
  client,
  logicFunctionId,
  seed,
}: {
  client: CoreApiClient;
  logicFunctionId: string;
  seed: EnrichmentWorkflowSeed;
}): Promise<SeedEnrichmentWorkflowResult> => {
  const existingCoreWorkflowId = await findExistingCoreWorkflowId({
    client,
    name: seed.workflowName,
  });

  if (isDefined(existingCoreWorkflowId)) {
    return {
      objectNameSingular: seed.objectNameSingular,
      workflowName: seed.workflowName,
      status: 'skipped',
      coreWorkflowId: existingCoreWorkflowId,
    };
  }

  const coreWorkflowId = await createCoreWorkflow({
    client,
    name: seed.workflowName,
  });

  if (!isDefined(coreWorkflowId)) {
    throw new PdlOperationError(
      `Failed to create workflow "${seed.workflowName}": no id returned.`,
    );
  }

  const coreWorkflowVersions = await queryCoreWorkflowVersions({
    client,
    coreWorkflowId,
  });

  const draftCoreWorkflowVersionId = coreWorkflowVersions.find(
    (coreWorkflowVersion) => coreWorkflowVersion.status === 'DRAFT',
  )?.id;

  if (!isDefined(draftCoreWorkflowVersionId)) {
    throw new PdlOperationError(
      `No draft version found for workflow "${seed.workflowName}".`,
    );
  }

  const stepId = crypto.randomUUID();

  await updateCoreWorkflowVersionTrigger({
    client,
    coreWorkflowVersionId: draftCoreWorkflowVersionId,
    trigger: buildBulkRecordsTrigger({
      objectNameSingular: seed.objectNameSingular,
      name: seed.triggerName,
      icon: seed.icon,
    }),
  });

  await createCoreWorkflowVersionLogicFunctionStep({
    client,
    coreWorkflowVersionId: draftCoreWorkflowVersionId,
    parentStepId: TRIGGER_STEP_ID,
    stepId,
    logicFunctionId,
  });

  await updateCoreWorkflowVersionStep({
    client,
    coreWorkflowVersionId: draftCoreWorkflowVersionId,
    step: buildLogicFunctionStep({
      id: stepId,
      name: seed.stepName,
      logicFunctionId,
      logicFunctionInput: seed.logicFunctionInput,
    }),
  });

  await activateCoreWorkflowVersion({
    client,
    coreWorkflowVersionId: draftCoreWorkflowVersionId,
  });

  return {
    objectNameSingular: seed.objectNameSingular,
    workflowName: seed.workflowName,
    status: 'created',
    coreWorkflowId,
  };
};
