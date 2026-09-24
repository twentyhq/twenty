import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

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
      updatedRecordingCount: 0,
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
  let updatedRecordingCount = 0;
  const clearedImportFields = {
    mediaDownloadId: null,
    mediaImportClaimedAt: null,
    mediaUploadCheckpoint: null,
  };
  const settledData = {
    ...clearedImportFields,
    mediaFailureReason:
      FATHOM_MEDIA_FAILURE_REASON.CONNECTED_ACCOUNT_UNAVAILABLE,
  };
  const updates = [
    {
      callRecordings: plan.callRecordingsToSettleAndComplete,
      importData: settledData,
      status: 'COMPLETED',
    },
    {
      callRecordings: plan.callRecordingsToSettleAndFail,
      importData: settledData,
      status: 'FAILED',
    },
    {
      callRecordings: plan.callRecordingsToSettle,
      importData: settledData,
    },
    {
      callRecordings: plan.callRecordingsToComplete,
      importData: clearedImportFields,
      status: 'COMPLETED',
    },
    {
      callRecordings: plan.callRecordingsToFail,
      importData: clearedImportFields,
      status: 'FAILED',
    },
  ];

  for (const { callRecordings, importData, status } of updates) {
    if (!isNonEmptyArray(callRecordings)) {
      continue;
    }

    const importResult = await coreApiClient.mutation({
      updateFathomRecordingImports: {
        __args: {
          filter: {
            connectedAccountId: { eq: connectedAccountId },
            or: callRecordings.map((reference) => ({
              id: { eq: reference.fathomRecordingImportId },
              updatedAt: {
                eq: reference.fathomRecordingImportUpdatedAt,
              },
            })),
          },
          data: importData,
        },
        id: true,
      },
    });
    const updatedImportIds = new Set(
      (importResult.updateFathomRecordingImports ?? []).map(
        ({ id }: { id: string }) => id,
      ),
    );

    if (!isDefined(status)) {
      updatedRecordingCount += updatedImportIds.size;
      continue;
    }

    const callRecordingsWithUpdatedImports = callRecordings.filter(
      ({ fathomRecordingImportId }) =>
        updatedImportIds.has(fathomRecordingImportId),
    );

    if (!isNonEmptyArray(callRecordingsWithUpdatedImports)) {
      continue;
    }

    const callRecordingResult = await coreApiClient.mutation({
      updateCallRecordings: {
        __args: {
          filter: {
            status: { eq: 'PROCESSING' },
            or: callRecordingsWithUpdatedImports.map((reference) => ({
              id: { eq: reference.callRecordingId },
              updatedAt: { eq: reference.callRecordingUpdatedAt },
              fathomRecordingImports: {
                id: { eq: reference.fathomRecordingImportId },
                connectedAccountId: { eq: connectedAccountId },
              },
            })),
          },
          data: { status },
        },
        id: true,
      },
    });

    updatedRecordingCount +=
      callRecordingResult.updateCallRecordings?.length ?? 0;
  }

  return {
    candidateCount: page.callRecordings.length,
    updatedRecordingCount,
    shouldContinue:
      page.hasNextPage || updatedRecordingCount < page.callRecordings.length,
    skipped: false,
  };
};
