import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isString, isUndefined } from '@sniptt/guards';
import { type TaskNode } from 'src/logic-functions/types/types';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import { TASKS_BATCH_SIZE } from 'src/constants/sync';

export const fetchTaskNodes = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<TaskNode[]> => {
  let afterCursor: string | undefined;
  let hasNextPage = true;
  const nodes: TaskNode[] = [];

  while (hasNextPage) {
    const tasks = await executeWithRetry(() =>
      client.query({
        tasks: {
          __args: {
            first: TASKS_BATCH_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
            filter,
          },
          edges: {
            node: {
              id: true,
              title: true,
              bodyV2: {
                markdown: true,
              },
              deletedAt: true,
              dueAt: true,
              status: true,
              googleTasksId: true,
              googleTasksListId: true,
            },
          },
          pageInfo: {
            hasNextPage: true,
            endCursor: true,
          },
        },
      }),
    );

    if (tasks.tasks === undefined) {
      throw new Error('Failed to fetch tasks from Twenty');
    }

    for (const edge of tasks.tasks.edges ?? []) {
      nodes.push(edge.node);
    }

    hasNextPage = tasks.tasks.pageInfo.hasNextPage === true;
    const endCursor = tasks.tasks.pageInfo.endCursor;

    if (hasNextPage && !isString(endCursor)) {
      throw new Error(
        'Inconsistent pagination state: hasNextPage is true without an endCursor',
      );
    }

    afterCursor = isString(endCursor) ? endCursor : undefined;
  }

  return nodes;
};
