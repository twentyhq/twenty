import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';

import { APPLY_STATUS_UPDATES_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';

type RequestBody = {
  sourceFileId: string;
};

const handler = async (event: { body: RequestBody | null }) => {
  const body = event.body;

  if (!body?.sourceFileId) {
    throw new Error('Missing sourceFileId in request body');
  }

  const sourceFileId = body.sourceFileId;
  const client = new CoreApiClient();

  // Idempotency guard: if already APPLYING, return immediately
  const { payReconSourceFiles: sfResult } = (await client.query({
    payReconSourceFiles: {
      __args: { filter: { id: { eq: sourceFileId } }, first: 1 },
      edges: { node: { id: true, parseStatus: true } },
    },
  })) as unknown as {
    payReconSourceFiles: {
      edges: { node: { id: string; parseStatus: string | null } }[];
    };
  };

  const sourceFile = sfResult.edges[0]?.node;

  if (!sourceFile) {
    throw new Error(`SourceFile ${sourceFileId} not found`);
  }

  if (sourceFile.parseStatus === 'APPLYING') {
    return { queued: false, message: 'Already in progress' };
  }

  // Set status to APPLYING which triggers apply-on-status DB event
  await client.mutation({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFileId,
        data: { parseStatus: 'APPLYING' },
      },
      id: true,
    },
  });

  return { queued: true, sourceFileId };
};

export default defineLogicFunction({
  universalIdentifier: APPLY_STATUS_UPDATES_LOGIC_FUNCTION_ID,
  name: 'apply-status-updates',
  description:
    'Queues apply by setting parseStatus to APPLYING (apply handled async via apply-on-status)',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/apply-status-updates',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
