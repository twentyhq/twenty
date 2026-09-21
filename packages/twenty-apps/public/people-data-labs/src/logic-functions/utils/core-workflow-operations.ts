import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type WorkflowBulkRecordsTrigger } from 'src/types/workflow-bulk-records-trigger';
import { type WorkflowLogicFunctionStep } from 'src/types/workflow-logic-function-step';
import { isDefined } from 'src/utils/is-defined';

type CoreWorkflowNode = { id?: string; name?: string | null };

type CoreWorkflowVersionNode = { id?: string; status?: string };

const callCoreOperation = async <TResult>(
  call: (request: never) => Promise<unknown>,
  request: Record<string, unknown>,
): Promise<TResult> => (await call(request as never)) as TResult;

const CORE_WORKFLOWS_PAGE_SIZE = 200;

export type CoreWorkflowsPage = {
  nodes: CoreWorkflowNode[];
  endCursor?: string;
  hasNextPage: boolean;
};

export const queryCoreWorkflowsByNameContains = async ({
  client,
  name,
  after,
}: {
  client: CoreApiClient;
  name: string;
  after?: string;
}): Promise<CoreWorkflowsPage> => {
  const result = await callCoreOperation<{
    coreWorkflows?: {
      edges?: { node?: CoreWorkflowNode }[];
      pageInfo?: { endCursor?: string | null; hasNextPage?: boolean };
    };
  }>((request) => client.query(request), {
    coreWorkflows: {
      __args: {
        first: CORE_WORKFLOWS_PAGE_SIZE,
        ...(isDefined(after) ? { after } : {}),
        filter: {
          logicalOperator: 'AND',
          rules: [{ fieldKey: 'NAME', operand: 'CONTAINS', value: name }],
        },
      },
      edges: { node: { id: true, name: true } },
      pageInfo: { endCursor: true, hasNextPage: true },
    },
  });

  return {
    nodes: (result.coreWorkflows?.edges ?? [])
      .map((edge) => edge.node)
      .filter(isDefined),
    endCursor: result.coreWorkflows?.pageInfo?.endCursor ?? undefined,
    hasNextPage: result.coreWorkflows?.pageInfo?.hasNextPage ?? false,
  };
};

export const createCoreWorkflow = async ({
  client,
  name,
}: {
  client: CoreApiClient;
  name: string;
}): Promise<string | undefined> => {
  const result = await callCoreOperation<{
    createCoreWorkflow?: { id?: string };
  }>((request) => client.mutation(request), {
    createCoreWorkflow: {
      __args: { input: { name } },
      id: true,
    },
  });

  return result.createCoreWorkflow?.id;
};

export const queryCoreWorkflowVersions = async ({
  client,
  coreWorkflowId,
}: {
  client: CoreApiClient;
  coreWorkflowId: string;
}): Promise<CoreWorkflowVersionNode[]> => {
  const result = await callCoreOperation<{
    coreWorkflowVersionsByCoreWorkflowId?: CoreWorkflowVersionNode[];
  }>((request) => client.query(request), {
    coreWorkflowVersionsByCoreWorkflowId: {
      __args: { coreWorkflowId },
      id: true,
      status: true,
    },
  });

  return result.coreWorkflowVersionsByCoreWorkflowId ?? [];
};

export const updateCoreWorkflowVersionTrigger = async ({
  client,
  coreWorkflowVersionId,
  trigger,
}: {
  client: CoreApiClient;
  coreWorkflowVersionId: string;
  trigger: WorkflowBulkRecordsTrigger;
}): Promise<void> => {
  await callCoreOperation((request) => client.mutation(request), {
    updateCoreWorkflowVersionTrigger: {
      __args: { input: { coreWorkflowVersionId, trigger } },
      trigger: true,
    },
  });
};

export const createCoreWorkflowVersionLogicFunctionStep = async ({
  client,
  coreWorkflowVersionId,
  parentStepId,
  stepId,
  logicFunctionId,
}: {
  client: CoreApiClient;
  coreWorkflowVersionId: string;
  parentStepId: string;
  stepId: string;
  logicFunctionId: string;
}): Promise<void> => {
  await callCoreOperation((request) => client.mutation(request), {
    createCoreWorkflowVersionStep: {
      __args: {
        input: {
          coreWorkflowVersionId,
          stepType: 'LOGIC_FUNCTION',
          parentStepId,
          id: stepId,
          defaultSettings: { input: { logicFunctionId } },
        },
      },
      triggerDiff: true,
      stepsDiff: true,
    },
  });
};

export const updateCoreWorkflowVersionStep = async ({
  client,
  coreWorkflowVersionId,
  step,
}: {
  client: CoreApiClient;
  coreWorkflowVersionId: string;
  step: WorkflowLogicFunctionStep;
}): Promise<void> => {
  await callCoreOperation((request) => client.mutation(request), {
    updateCoreWorkflowVersionStep: {
      __args: { input: { coreWorkflowVersionId, step } },
      id: true,
    },
  });
};

export const activateCoreWorkflowVersion = async ({
  client,
  coreWorkflowVersionId,
}: {
  client: CoreApiClient;
  coreWorkflowVersionId: string;
}): Promise<void> => {
  await callCoreOperation((request) => client.mutation(request), {
    activateCoreWorkflowVersion: { __args: { coreWorkflowVersionId } },
  });
};
