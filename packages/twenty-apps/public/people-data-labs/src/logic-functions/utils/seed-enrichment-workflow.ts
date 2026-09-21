import { type CoreApiClient } from 'twenty-client-sdk/core';

import { PdlOperationError } from 'src/logic-functions/errors/pdl-operation-error';
import { buildBulkRecordsTrigger } from 'src/logic-functions/utils/build-bulk-records-trigger';
import { buildLogicFunctionStep } from 'src/logic-functions/utils/build-logic-function-step';
import { findExistingWorkflowId } from 'src/logic-functions/utils/find-existing-workflow-id';
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
  const existingWorkflowId = await findExistingWorkflowId({
    client,
    name: seed.workflowName,
  });

  if (isDefined(existingWorkflowId)) {
    return {
      objectNameSingular: seed.objectNameSingular,
      workflowName: seed.workflowName,
      status: 'skipped',
      workflowId: existingWorkflowId,
    };
  }

  const createResult = (await client.mutation({
    createWorkflow: {
      __args: { data: { name: seed.workflowName } },
      id: true,
    },
  })) as { createWorkflow?: { id?: string } };

  const workflowId = createResult.createWorkflow?.id;

  if (!isDefined(workflowId)) {
    throw new PdlOperationError(
      `Failed to create workflow "${seed.workflowName}": no id returned.`,
    );
  }

  const versionsResult = (await client.query({
    workflowVersions: {
      __args: { filter: { workflowId: { eq: workflowId } } },
      edges: { node: { id: true, status: true } },
    },
  })) as {
    workflowVersions?: { edges?: { node?: { id?: string; status?: string } }[] };
  };

  const draftVersionId = versionsResult.workflowVersions?.edges?.find(
    (edge) => edge.node?.status === 'DRAFT',
  )?.node?.id;

  if (!isDefined(draftVersionId)) {
    throw new PdlOperationError(
      `No draft version found for workflow "${seed.workflowName}".`,
    );
  }

  const stepId = crypto.randomUUID();

  const trigger = buildBulkRecordsTrigger({
    objectNameSingular: seed.objectNameSingular,
    name: seed.triggerName,
    icon: seed.icon,
  });

  await client.mutation({
    updateWorkflowVersion: {
      __args: { id: draftVersionId, data: { trigger } },
      id: true,
    },
  });

  const callMutationNotYetInClientSchema = (
    request: unknown,
  ): Promise<unknown> => client.mutation(request as never);

  await callMutationNotYetInClientSchema({
    createWorkflowVersionStep: {
      __args: {
        input: {
          workflowVersionId: draftVersionId,
          stepType: 'LOGIC_FUNCTION',
          parentStepId: TRIGGER_STEP_ID,
          id: stepId,
          defaultSettings: { input: { logicFunctionId } },
        },
      },
      triggerDiff: true,
      stepsDiff: true,
    },
  });

  const step = buildLogicFunctionStep({
    id: stepId,
    name: seed.stepName,
    logicFunctionId,
    logicFunctionInput: seed.logicFunctionInput,
  });

  await callMutationNotYetInClientSchema({
    updateWorkflowVersionStep: {
      __args: { input: { workflowVersionId: draftVersionId, step } },
      id: true,
    },
  });

  await callMutationNotYetInClientSchema({
    activateWorkflowVersion: {
      __args: { workflowVersionId: draftVersionId },
    },
  });

  return {
    objectNameSingular: seed.objectNameSingular,
    workflowName: seed.workflowName,
    status: 'created',
    workflowId,
  };
};
