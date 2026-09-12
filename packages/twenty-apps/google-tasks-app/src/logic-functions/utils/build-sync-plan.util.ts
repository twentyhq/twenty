import { type CoreApiClient } from "twenty-client-sdk/core";
import { isNull, isString, isUndefined } from "@sniptt/guards";
import { type GoogleTask, TaskFields, TaskNode, TasksSyncPlan } from "src/logic-functions/types/types";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { normalizeDueDate } from "src/logic-functions/utils/normalize-due-date.util";
import { TASKS_BATCH_SIZE } from "src/constants/sync";

const isSameDueDate = (due: string | undefined, dueAt: string | null | undefined) => {
  const normalizedDue = normalizeDueDate(due);

  if (isNull(normalizedDue)) {
    return !isString(dueAt);
  }

  if (!isString(dueAt)) {
    return false;
  }

  return new Date(normalizedDue).getTime() === new Date(dueAt).getTime();
};

const isSameStatus = (completed: string | undefined, status: string | null | undefined) =>
  isUndefined(completed) ? status !== 'DONE' : status === 'DONE';

const diffTask = (googleTask: GoogleTask, existingTask: TaskNode): TaskFields | null => {
  const fields: TaskFields = {};

  if (googleTask.title !== existingTask.title) {
    fields.title = googleTask.title;
  }

  const markdown = googleTask.notes ?? null;

  if (markdown !== (existingTask.bodyV2?.markdown ?? null)) {
    fields.bodyV2 = { markdown };
  }

  if (!isSameDueDate(googleTask.due, existingTask.dueAt)) {
    fields.dueAt = normalizeDueDate(googleTask.due);
  }

  if (!isSameStatus(googleTask.completed, existingTask.status)) {
    fields.status = googleTask.completed ? 'DONE' : 'TODO';
  }

  return Object.keys(fields).length === 0 ? null : fields;
};

export const partitionTasks = (
  googleTasks: GoogleTask[],
  existingTasks: TaskNode[],
): TasksSyncPlan => {
  const plan: TasksSyncPlan = {
    tasksToCreate: [],
    tasksToUpdate: [],
  };

  const existingTaskByGoogleTasksId = new Map<string, TaskNode>();

  for (const node of existingTasks) {
    if (isString(node.googleTasksId)) {
      existingTaskByGoogleTasksId.set(node.googleTasksId, node);
    }
  }

  for (const googleTask of googleTasks) {
    const existingTask = existingTaskByGoogleTasksId.get(googleTask.id);

    if (isUndefined(existingTask)) {
      if (googleTask.deleted !== true) {
        plan.tasksToCreate.push(googleTask);
      }

      continue;
    }

    if (isString(existingTask.deletedAt) || googleTask.deleted) {
      continue;
    }

    const fields = diffTask(googleTask, existingTask);

    if (fields !== null) {
      plan.tasksToUpdate.push({ id: existingTask.id, fields });
    }
  }

  return plan;
};

export const buildSyncPlan = async (
  client: CoreApiClient,
  googleTasks: GoogleTask[],
): Promise<TasksSyncPlan> => {
  if (googleTasks.length === 0) {
    return { tasksToCreate: [], tasksToUpdate: [] };
  }
  const googleTasksIds = googleTasks.map((googleTask) => googleTask.id);

  let afterCursor: string | undefined;
  let hasNextPage = true;
  const nodes: TaskNode[] = [];

  while (hasNextPage) {
    const tasks = await executeWithRetry(() => client.query({
      tasks: {
        __args: {
          first: TASKS_BATCH_SIZE,
          ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
          filter: {
            googleTasksId: {
              in: googleTasksIds,
            },
            or: [
              { deletedAt: { is: 'NULL' } },
              { deletedAt: { is: 'NOT_NULL' } },
            ],
          },
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
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        }
      },
    }));

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

  return partitionTasks(googleTasks, nodes);
}
