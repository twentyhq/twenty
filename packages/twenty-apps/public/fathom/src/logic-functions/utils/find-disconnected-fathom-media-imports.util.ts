import { type CoreApiClient } from 'twenty-client-sdk/core';

import { FATHOM_MEDIA_RECONCILIATION_SELECTION } from 'src/constants/fathom-media-reconciliation-selection.constant';
import { FATHOM_MEDIA_RECONCILIATION_PAGE_SIZE } from 'src/constants/fathom.constant';
import { type FathomMediaReconciliationPage } from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { parseFathomMediaReconciliationPage } from 'src/logic-functions/utils/parse-fathom-media-reconciliation-page.util';

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
      ...FATHOM_MEDIA_RECONCILIATION_SELECTION,
    },
  });
  return parseFathomMediaReconciliationPage(queryResult);
};
