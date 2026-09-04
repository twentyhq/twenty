import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_MEDIA_RECONCILIATION_PAGE_SIZE } from 'src/constants/fathom.constant';
import { fathomMediaReconciliationQueryResultSchema } from 'src/logic-functions/schemas/fathom-media-reconciliation-query-result.schema';
import { type FathomMediaReconciliationPage } from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { mapCallRecordingMediaState } from 'src/logic-functions/utils/map-call-recording-media-state.util';

export const findDisconnectedFathomMediaImports = async ({
  coreApiClient,
  connectedAccountId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  connectedAccountId: string;
}): Promise<FathomMediaReconciliationPage> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          fathomConnectedAccountId: { eq: connectedAccountId },
          or: [
            {
              fathomMediaFailureReason: { is: 'NULL' },
              video: { is: 'NULL' },
              audio: { is: 'NULL' },
            },
            { status: { eq: 'PROCESSING' } },
          ],
        },
        first: FATHOM_MEDIA_RECONCILIATION_PAGE_SIZE,
        orderBy: [{ id: 'AscNullsLast' }],
      },
      pageInfo: { hasNextPage: true },
      edges: {
        node: {
          id: true,
          externalRecordingId: true,
          video: { fileId: true },
          audio: { fileId: true },
          fathomMediaFailureReason: true,
          fathomConnectedAccountId: true,
          fathomMediaDownloadId: true,
          transcript: true,
          status: true,
          updatedAt: true,
          fathomMediaUploadCheckpoint: true,
        },
      },
    },
  });
  const connection =
    fathomMediaReconciliationQueryResultSchema.parse(
      queryResult,
    ).callRecordings;

  if (!isDefined(connection)) {
    return { callRecordings: [], hasNextPage: false };
  }

  return {
    callRecordings: connection.edges.map(({ node }) => ({
      ...mapCallRecordingMediaState(node),
      status: node.status,
      updatedAt: node.updatedAt,
    })),
    hasNextPage: connection.pageInfo.hasNextPage,
  };
};
