import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';

import { MATCH_BOB_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';

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

  // Idempotency guard: if already MATCHING, return immediately
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

  if (sourceFile.parseStatus === 'MATCHING') {
    return { queued: false, message: 'Already in progress' };
  }

  // Two-step status change to guarantee a DB event fires even if
  // the file is already in COMPLETED state (no-op updates don't
  // trigger DB events). First reset to PARSING, then set COMPLETED.
  if (sourceFile.parseStatus === 'COMPLETED') {
    await client.mutation({
      updatePayReconSourceFile: {
        __args: {
          id: sourceFileId,
          data: { parseStatus: 'PARSING' },
        },
        id: true,
      },
    });
  }

  await client.mutation({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFileId,
        data: { parseStatus: 'COMPLETED' },
      },
      id: true,
    },
  });

  return { queued: true, sourceFileId };
};

export default defineLogicFunction({
  universalIdentifier: MATCH_BOB_LOGIC_FUNCTION_ID,
  name: 'match-bob',
  description:
    'Queues matching by setting parseStatus to COMPLETED (matching handled async via match-on-completed)',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/match-bob',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
