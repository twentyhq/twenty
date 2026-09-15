import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, listConnections } from 'twenty-sdk/logic-function';
import { chunk } from 'src/logic-functions/utils/chunk.util';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import {
  ENTRY_POINT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SYNC_TASKS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  GOOGLE_TASKS_CONNECTION_PROVIDER_NAME,
  MAX_JOBS_PER_ENQUEUE,
} from 'src/constants/sync';

const handler = async () => {
  const connections = await executeWithRetry(() =>
    listConnections({
      providerName: GOOGLE_TASKS_CONNECTION_PROVIDER_NAME,
      visibility: 'user',
    }),
  );

  const jobs = connections
    .filter((connection) => connection.authFailedAt === null)
    .map((connection) => ({ payload: { connectionId: connection.id } }));

  for (const batch of chunk(jobs, MAX_JOBS_PER_ENQUEUE)) {
    await executeWithRetry(() =>
      enqueueJobs({
        logicFunctionUniversalIdentifier:
          SYNC_TASKS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs: batch,
      }),
    );
  }
};

export default defineLogicFunction({
  universalIdentifier: ENTRY_POINT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'entry-point',
  description: 'Enqueues one independent sync-tasks run per user connection',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/15 * * * *',
  },
});
