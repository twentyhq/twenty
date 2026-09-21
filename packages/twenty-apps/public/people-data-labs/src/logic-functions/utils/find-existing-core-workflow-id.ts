import { type CoreApiClient } from 'twenty-client-sdk/core';

import { queryCoreWorkflowsByNameContains } from 'src/logic-functions/utils/core-workflow-operations';
import { isDefined } from 'src/utils/is-defined';

export const findExistingCoreWorkflowId = async ({
  client,
  name,
}: {
  client: CoreApiClient;
  name: string;
}): Promise<string | undefined> => {
  let after: string | undefined;

  for (;;) {
    const { nodes, endCursor, hasNextPage } =
      await queryCoreWorkflowsByNameContains({ client, name, after });

    const exactMatch = nodes.find((coreWorkflow) => coreWorkflow.name === name);

    if (isDefined(exactMatch)) {
      return exactMatch.id;
    }

    if (!hasNextPage || !isDefined(endCursor)) {
      return undefined;
    }

    after = endCursor;
  }
};
