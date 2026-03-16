import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';

import { REPARSE_BOB_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';

type RequestBody = {
  sourceFileId: string;
};

const handler = async (event: { body: RequestBody | null }) => {
  const body = event.body;

  if (!body?.sourceFileId) {
    throw new Error('Missing sourceFileId in request body');
  }

  const client = new CoreApiClient();

  // Verify source file exists
  const { payReconSourceFiles: sfResult } = (await client.query({
    payReconSourceFiles: {
      __args: { filter: { id: { eq: body.sourceFileId } }, first: 1 },
      edges: { node: { id: true, parseStatus: true } },
    },
  })) as unknown as {
    payReconSourceFiles: {
      edges: { node: { id: string; parseStatus: string | null } }[];
    };
  };

  const sourceFile = sfResult.edges[0]?.node;

  if (!sourceFile) {
    throw new Error(`SourceFile ${body.sourceFileId} not found`);
  }

  // Set parseStatus to PENDING — cleanup + parsing happens async via parse-on-pending
  await client.mutation({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFile.id,
        data: {
          parseStatus: 'PENDING',
          parseError: null,
          totalRows: null,
          parsedAt: null,
        },
      },
      id: true,
    },
  });

  return {
    sourceFileId: sourceFile.id,
    queued: true,
  };
};

export default defineLogicFunction({
  universalIdentifier: REPARSE_BOB_LOGIC_FUNCTION_ID,
  name: 'reparse-bob',
  description:
    'Queues a re-parse by setting parseStatus to PENDING (cleanup + parsing handled async)',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/reparse-bob',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
