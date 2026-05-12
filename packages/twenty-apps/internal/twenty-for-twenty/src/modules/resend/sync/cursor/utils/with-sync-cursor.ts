import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { getOrCreateSyncCursor } from 'src/modules/resend/sync/cursor/utils/get-or-create-sync-cursor';
import {
  setCursor,
  updateCursorRow,
} from 'src/modules/resend/sync/cursor/utils/set-cursor';
import type { SyncCursorStep } from 'src/modules/resend/sync/cursor/types/sync-cursor-step';

export type SyncCursorContext = {
  resumeCursor: string | undefined;
  onCursorAdvance: (cursor: string) => Promise<void>;
};

export type SyncCursorRunResult<TValue> = {
  value: TValue;
  completed: boolean;
};

export type WithSyncCursorOptions = {
  preserveCursor?: boolean;
};

export const withSyncCursor = async <TValue>(
  client: CoreApiClient,
  step: SyncCursorStep,
  runWithCursor: (
    context: SyncCursorContext,
  ) => Promise<SyncCursorRunResult<TValue>>,
  options?: WithSyncCursorOptions,
): Promise<TValue> => {
  const cursorRow = await getOrCreateSyncCursor(client, step);
  const startedAt = new Date().toISOString();
  const preserveCursor = options?.preserveCursor === true;

  await updateCursorRow(client, cursorRow.id, {
    lastRunAt: startedAt,
    lastRunStatus: 'IN_PROGRESS',
  });

  const hasResumeCursor =
    isDefined(cursorRow.cursor) && cursorRow.cursor.length > 0;

  if (hasResumeCursor) {
    console.log(
      `[sync] resuming step ${step} from cursor ${cursorRow.cursor}`,
    );
  }

  const context: SyncCursorContext = {
    resumeCursor: hasResumeCursor ? cursorRow.cursor ?? undefined : undefined,
    onCursorAdvance: preserveCursor
      ? async () => undefined
      : (cursor) => setCursor(client, cursorRow.id, cursor),
  };

  try {
    const { value, completed } = await runWithCursor(context);

    if (completed) {
      await updateCursorRow(client, cursorRow.id, {
        ...(preserveCursor ? {} : { cursor: null }),
        lastRunStatus: 'SUCCESS',
      });
    } else {
      await updateCursorRow(client, cursorRow.id, {
        lastRunStatus: 'IN_PROGRESS',
      });
    }

    return value;
  } catch (runError) {
    await updateCursorRow(client, cursorRow.id, {
      lastRunStatus: 'FAILED',
    });

    throw runError;
  }
};
