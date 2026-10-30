import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

type ExistingCallRecording = {
  id: string;
  status: string | null;
  createdAt: string;
  deletedAt?: string | null;
};

const getCallRecordingIds = (callRecordings: ExistingCallRecording[]) =>
  new Set(callRecordings.map((callRecording) => callRecording.id));

export const findDeletedAndCompletedCallRecordingIdsOrThrow = async ({
  coreApiClient,
  callRecordingIds,
  importedSince,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
  importedSince?: string;
}): Promise<{
  deletedCallRecordingIds: Set<string>;
  completedCallRecordingIds: Set<string>;
  importedCallRecordingIds: Set<string>;
}> => {
  if (callRecordingIds.length === 0) {
    return {
      deletedCallRecordingIds: new Set(),
      completedCallRecordingIds: new Set(),
      importedCallRecordingIds: new Set(),
    };
  }

  const result: {
    callRecordings?: { edges?: { node: ExistingCallRecording }[] };
  } = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          id: { in: callRecordingIds },
          or: [
            { deletedAt: { is: 'NULL' } },
            { deletedAt: { is: 'NOT_NULL' } },
          ],
        },
        first: callRecordingIds.length,
      },
      edges: {
        node: { id: true, status: true, createdAt: true, deletedAt: true },
      },
    },
  });
  const callRecordings =
    result.callRecordings?.edges?.map((edge) => edge.node) ?? [];
  const completedCallRecordings = callRecordings.filter(
    (callRecording) =>
      !isDefined(callRecording.deletedAt) &&
      callRecording.status === 'COMPLETED',
  );
  // A recording this run created was written by a failed attempt of the page.
  const isImportedByThisRun = (callRecording: ExistingCallRecording) =>
    isDefined(importedSince) &&
    Date.parse(callRecording.createdAt) >= Date.parse(importedSince);

  return {
    deletedCallRecordingIds: getCallRecordingIds(
      callRecordings.filter((callRecording) =>
        isDefined(callRecording.deletedAt),
      ),
    ),
    completedCallRecordingIds: getCallRecordingIds(
      completedCallRecordings.filter(
        (callRecording) => !isImportedByThisRun(callRecording),
      ),
    ),
    importedCallRecordingIds: getCallRecordingIds(
      completedCallRecordings.filter(isImportedByThisRun),
    ),
  };
};
