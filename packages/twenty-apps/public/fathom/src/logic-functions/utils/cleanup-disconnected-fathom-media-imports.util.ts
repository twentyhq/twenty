import { type CoreApiClient } from 'twenty-client-sdk/core';

import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';
import { buildDisconnectedFathomMediaReconciliationPlan } from 'src/logic-functions/utils/build-disconnected-fathom-media-reconciliation-plan.util';
import { findDisconnectedFathomMediaImports } from 'src/logic-functions/utils/find-disconnected-fathom-media-imports.util';
import { listFathomConnections } from 'src/logic-functions/utils/list-fathom-connections.util';

export const cleanupDisconnectedFathomMediaImports = async ({
  coreApiClient,
  connectedAccountId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  connectedAccountId: string;
}) => {
  const connections = await listFathomConnections();

  if (connections.some(({ id }) => id === connectedAccountId)) {
    return {
      candidateCount: 0,
      updatedCallRecordingCount: 0,
      shouldContinue: false,
      skipped: true,
    };
  }

  const page = await findDisconnectedFathomMediaImports({
    coreApiClient,
    connectedAccountId,
  });
  const plan = buildDisconnectedFathomMediaReconciliationPlan(
    page.callRecordings,
  );
  let updatedCallRecordingCount = 0;
  const clearedImportFields = {
    fathomMediaDownloadId: null,
    fathomMediaImportClaimedAt: null,
    fathomMediaUploadCheckpoint: null,
  };
  const settledData = {
    ...clearedImportFields,
    fathomMediaFailureReason:
      FATHOM_MEDIA_FAILURE_REASON.CONNECTED_ACCOUNT_UNAVAILABLE,
  };
  const processingFilter = { status: { eq: 'PROCESSING' } };
  const updates = [
    {
      callRecordings: plan.callRecordingsToSettleAndComplete,
      filter: processingFilter,
      data: { ...settledData, status: 'COMPLETED' },
    },
    {
      callRecordings: plan.callRecordingsToSettleAndFail,
      filter: processingFilter,
      data: { ...settledData, status: 'FAILED' },
    },
    {
      callRecordings: plan.callRecordingsToSettle,
      filter: {},
      data: settledData,
    },
    {
      callRecordings: plan.callRecordingsToComplete,
      filter: processingFilter,
      data: { ...clearedImportFields, status: 'COMPLETED' },
    },
    {
      callRecordings: plan.callRecordingsToFail,
      filter: processingFilter,
      data: { ...clearedImportFields, status: 'FAILED' },
    },
  ];

  for (const { callRecordings, filter, data } of updates) {
    if (callRecordings.length === 0) {
      continue;
    }

    const result = await coreApiClient.mutation({
      updateCallRecordings: {
        __args: {
          filter: {
            ...filter,
            fathomConnectedAccountId: { eq: connectedAccountId },
            or: callRecordings.map(({ id, updatedAt }) => ({
              id: { eq: id },
              updatedAt: { eq: updatedAt },
            })),
          },
          data,
        },
        id: true,
      },
    });

    updatedCallRecordingCount += result.updateCallRecordings?.length ?? 0;
  }

  return {
    candidateCount: page.callRecordings.length,
    updatedCallRecordingCount,
    shouldContinue:
      page.hasNextPage ||
      updatedCallRecordingCount < page.callRecordings.length,
  };
};
