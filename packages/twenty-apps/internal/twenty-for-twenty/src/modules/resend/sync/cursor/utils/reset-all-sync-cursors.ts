import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { extractConnection } from '@modules/resend/shared/utils/typed-client';
import { RESEND_SYNC_CURSOR_STEPS } from '@modules/resend/sync/cursor/constants/resend-sync-cursor-steps';
import { updateCursorRow } from '@modules/resend/sync/cursor/utils/set-cursor';

type SyncCursorIdNode = {
  id: string;
};

export const resetAllSyncCursors = async (
  client: CoreApiClient,
): Promise<void> => {
  const queryResult = await client.query({
    resendSyncCursors: {
      __args: {
        first: RESEND_SYNC_CURSOR_STEPS.length + 5,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const connection = extractConnection<SyncCursorIdNode>(
    queryResult,
    'resendSyncCursors',
  );

  const ids = connection.edges
    .map((edge) => edge.node?.id)
    .filter((id): id is string => isDefined(id) && id.length > 0);

  await Promise.all(
    ids.map((id) =>
      updateCursorRow(client, id, {
        cursor: null,
        lastRunAt: null,
        lastRunStatus: null,
      }),
    ),
  );
};
