import { CoreApiClient } from 'twenty-client-sdk/core';

export type SyncRunStatus = 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';

type CursorUpdate = {
  cursor?: string | null;
  lastRunAt?: string | null;
  lastRunStatus?: SyncRunStatus | null;
};

export const setCursor = async (
  client: CoreApiClient,
  id: string,
  cursor: string | null,
): Promise<void> => {
  await client.mutation({
    updateResendSyncCursor: {
      __args: { id, data: { cursor } },
      id: true,
    },
  });
};

export const updateCursorRow = async (
  client: CoreApiClient,
  id: string,
  data: CursorUpdate,
): Promise<void> => {
  await client.mutation({
    updateResendSyncCursor: {
      __args: { id, data },
      id: true,
    },
  });
};
