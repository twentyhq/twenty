import { type CoreApiClient } from 'twenty-client-sdk/core';

import { doesCallRecordingMatchFilterOrThrow } from 'src/logic-functions/utils/does-call-recording-match-filter-or-throw.util';

export const isCallRecordingSoftDeletedOrThrow = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<boolean> =>
  doesCallRecordingMatchFilterOrThrow({
    coreApiClient,
    filter: { id: { eq: callRecordingId }, deletedAt: { is: 'NOT_NULL' } },
  });
