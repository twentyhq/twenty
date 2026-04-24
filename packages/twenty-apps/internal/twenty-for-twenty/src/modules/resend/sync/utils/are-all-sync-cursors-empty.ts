import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { extractConnection } from '@modules/resend/shared/utils/typed-client';
import { RESEND_SYNC_CURSOR_STEPS } from '@modules/resend/sync/cursor/constants/resend-sync-cursor-steps';
import type { SyncCursorStep } from '@modules/resend/sync/cursor/types/sync-cursor-step';

type SyncCursorNode = {
  step: SyncCursorStep;
  cursor: string | null;
  lastRunStatus: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | null;
};

export const areAllSyncCursorsEmpty = async (
  client: CoreApiClient,
): Promise<boolean> => {
  const queryResult = await client.query({
    resendSyncCursors: {
      __args: {
        first: RESEND_SYNC_CURSOR_STEPS.length + 5,
      },
      edges: {
        node: {
          step: true,
          cursor: true,
          lastRunStatus: true,
        },
      },
    },
  });

  const connection = extractConnection<SyncCursorNode>(
    queryResult,
    'resendSyncCursors',
  );

  const rowByStep = new Map<SyncCursorStep, SyncCursorNode>();

  for (const edge of connection.edges) {
    if (isDefined(edge.node?.step)) {
      rowByStep.set(edge.node.step, edge.node);
    }
  }

  return RESEND_SYNC_CURSOR_STEPS.every((step) => {
    const row = rowByStep.get(step);

    if (!isDefined(row)) return false;

    const cursorCleared = !isDefined(row.cursor) || row.cursor.length === 0;
    const notFailed = row.lastRunStatus !== 'FAILED';

    return cursorCleared && notFailed;
  });
};
