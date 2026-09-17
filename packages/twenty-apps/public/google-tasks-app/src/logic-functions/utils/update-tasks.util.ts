import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isUndefined } from '@sniptt/guards';
import { chunk } from 'src/logic-functions/utils/chunk.util';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import { TASKS_BATCH_SIZE, UPDATE_CONCURRENCY } from 'src/constants/sync';
import {
  type TaskFields,
  type TaskUpdate,
} from 'src/logic-functions/types/types';

type UpdateOperation = {
  fields: TaskFields;
  ids: string[];
};

export const groupUpdates = (taskUpdates: TaskUpdate[]): UpdateOperation[] => {
  const operationByFields = new Map<string, UpdateOperation>();

  for (const { id, fields } of taskUpdates) {
    const key = JSON.stringify(fields);
    const operation = operationByFields.get(key);

    if (isUndefined(operation)) {
      operationByFields.set(key, { fields, ids: [id] });

      continue;
    }

    operation.ids.push(id);
  }

  return [...operationByFields.values()].flatMap(({ fields, ids }) =>
    chunk(ids, TASKS_BATCH_SIZE).map((batch) => ({ fields, ids: batch })),
  );
};

export const updateTasks = async (
  client: CoreApiClient,
  taskUpdates: TaskUpdate[],
) => {
  for (const batch of chunk(groupUpdates(taskUpdates), UPDATE_CONCURRENCY)) {
    await Promise.all(
      batch.map(({ fields, ids }) =>
        executeWithRetry(() =>
          client.mutation({
            updateTasks: {
              __args: {
                data: fields,
                filter: {
                  id: {
                    in: ids,
                  },
                },
              },
              id: true,
            },
          }),
        ),
      ),
    );
  }
};
