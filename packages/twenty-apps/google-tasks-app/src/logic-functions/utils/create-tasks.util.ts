import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type GoogleTask } from 'src/logic-functions/types/types';
import { chunk } from 'src/logic-functions/utils/chunk.util';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import { normalizeDueDate } from 'src/logic-functions/utils/normalize-due-date.util';
import { normalizeNotes } from 'src/logic-functions/utils/normalize-notes.util';
import { TASKS_BATCH_SIZE } from 'src/constants/sync';

export const createTasks = async (
  client: CoreApiClient,
  assigneeId: string,
  listId: string,
  googleTasks: GoogleTask[],
) => {
  for (const batch of chunk(googleTasks, TASKS_BATCH_SIZE)) {
    await executeWithRetry(() =>
      client.mutation({
        createTasks: {
          __args: {
            data: batch.map((googleTask) => ({
              assigneeId,
              googleTasksId: googleTask.id,
              googleTasksListId: listId,
              title: googleTask.title,
              bodyV2: {
                markdown: normalizeNotes(googleTask.notes),
              },
              dueAt: normalizeDueDate(googleTask.due),
              status: googleTask.completed
                ? ('DONE' as const)
                : ('TODO' as const),
            })),
          },
          id: true,
        },
      }),
    );
  }
};
