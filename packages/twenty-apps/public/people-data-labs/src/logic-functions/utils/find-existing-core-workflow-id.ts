import { type CoreApiClient } from 'twenty-client-sdk/core';

import { queryCoreWorkflowsByNameContains } from 'src/logic-functions/utils/core-workflow-operations';

// The core name filter has no exact-match operand, so the exact name is matched
// here to keep seeding idempotent rather than matching a longer workflow name.
export const findExistingCoreWorkflowId = async ({
  client,
  name,
}: {
  client: CoreApiClient;
  name: string;
}): Promise<string | undefined> => {
  const coreWorkflows = await queryCoreWorkflowsByNameContains({
    client,
    name,
  });

  return coreWorkflows.find((coreWorkflow) => coreWorkflow.name === name)?.id;
};
