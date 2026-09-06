import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { FATHOM_MEDIA_RECONCILIATION_SELECTION } from 'src/constants/fathom-media-reconciliation-selection.constant';
import { FATHOM_MEDIA_RECONCILIATION_PAGE_SIZE } from 'src/constants/fathom.constant';
import {
  type FathomMediaReconciliationPage,
  type FathomMediaReconciliationRun,
} from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { parseFathomMediaReconciliationPage } from 'src/logic-functions/utils/parse-fathom-media-reconciliation-page.util';

export const findStaleFathomMediaImports = async ({
  coreApiClient,
  run,
  activeConnectedAccountIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  run: FathomMediaReconciliationRun;
  activeConnectedAccountIds: string[];
}): Promise<FathomMediaReconciliationPage> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          and: [
            { fathomConnectedAccountId: { is: 'NOT_NULL' } },
            { updatedAt: { lte: run.staleBefore } },
            {
              or: [
                { startedAt: { gte: run.startedAfter } },
                {
                  fathomConnectedAccountId: {
                    notIn: activeConnectedAccountIds,
                  },
                },
              ],
            },
            ...(isNonEmptyString(run.afterId)
              ? [{ id: { gt: run.afterId } }]
              : []),
            {
              or: [
                {
                  fathomMediaFailureReason: { is: 'NULL' },
                  video: { is: 'NULL' },
                  audio: { is: 'NULL' },
                },
                {
                  status: { eq: 'PROCESSING' },
                  transcript: { is: 'NOT_NULL' },
                  or: [
                    { video: { is: 'NOT_NULL' } },
                    { audio: { is: 'NOT_NULL' } },
                    { fathomMediaFailureReason: { is: 'NOT_NULL' } },
                  ],
                },
                {
                  status: { eq: 'PROCESSING' },
                  fathomConnectedAccountId: {
                    notIn: activeConnectedAccountIds,
                  },
                },
              ],
            },
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
