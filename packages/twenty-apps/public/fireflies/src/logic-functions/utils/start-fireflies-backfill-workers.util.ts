import { enqueueJobs, listConnections } from 'twenty-sdk/logic-function';

import { FIREFLIES_BACKFILL_OUTCOME } from 'src/constants/fireflies-backfill-outcome.constant';
import { FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type StartFirefliesBackfillWorkersResult =
  | {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED;
      error: string;
    }
  | {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.STARTED;
      connectionCount: number;
    };

export const startFirefliesBackfillWorkers = async ({
  days,
}: {
  days: number;
}): Promise<StartFirefliesBackfillWorkersResult> => {
  const connections = await listConnections({
    providerName: 'fireflies',
    visibility: 'workspace',
  });

  if (connections.length === 0) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED,
      error:
        'Fireflies is not configured. Add at least one workspace-shared Fireflies connection.',
    };
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      FIREFLIES_BACKFILL_WORKER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: connections.map((connection) => ({
      connectionId: connection.id,
      days,
    })),
  });

  return {
    outcome: FIREFLIES_BACKFILL_OUTCOME.STARTED,
    connectionCount: connections.length,
  };
};
