import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isNull, isString, isUndefined } from '@sniptt/guards';
import {
  type GoogleTask,
  TaskFields,
  TaskNode,
  TasksSyncPlan,
} from 'src/logic-functions/types/types';
import { fetchTaskNodes } from 'src/logic-functions/utils/fetch-task-nodes.util';
import { normalizeDueDate } from 'src/logic-functions/utils/normalize-due-date.util';
import { normalizeNotes } from 'src/logic-functions/utils/normalize-notes.util';

const isSameDueDate = (
  due: string | undefined,
  dueAt: string | null | undefined,
) => {
  const normalizedDue = normalizeDueDate(due);

  if (isNull(normalizedDue)) {
    return !isString(dueAt);
  }

  if (!isString(dueAt)) {
    return false;
  }

  return new Date(normalizedDue).getTime() === new Date(dueAt).getTime();
};

const isSameStatus = (
  completed: string | undefined,
  status: string | null | undefined,
) => (isUndefined(completed) ? status !== 'DONE' : status === 'DONE');

const diffTask = (
  googleTask: GoogleTask,
  existingTask: TaskNode,
  listId: string,
): TaskFields | null => {
  const fields: TaskFields = {};

  if (googleTask.title !== existingTask.title) {
    fields.title = googleTask.title;
  }

  const markdown = normalizeNotes(googleTask.notes);

  if (markdown !== normalizeNotes(existingTask.bodyV2?.markdown)) {
    fields.bodyV2 = { markdown };
  }

  if (!isSameDueDate(googleTask.due, existingTask.dueAt)) {
    fields.dueAt = normalizeDueDate(googleTask.due);
  }

  if (!isSameStatus(googleTask.completed, existingTask.status)) {
    fields.status = googleTask.completed ? 'DONE' : 'TODO';
  }

  if (listId !== existingTask.googleTasksListId) {
    fields.googleTasksListId = listId;
  }

  return Object.keys(fields).length === 0 ? null : fields;
};

export const partitionTasks = (
  googleTasks: GoogleTask[],
  existingTasks: TaskNode[],
  listId: string,
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

    const fields = diffTask(googleTask, existingTask, listId);

    if (fields !== null) {
      plan.tasksToUpdate.push({ id: existingTask.id, fields });
    }
  }

  return plan;
};

export const buildSyncPlan = async (
  client: CoreApiClient,
  googleTasks: GoogleTask[],
  listId: string,
): Promise<TasksSyncPlan> => {
  if (googleTasks.length === 0) {
    return { tasksToCreate: [], tasksToUpdate: [] };
  }

  const nodes = await fetchTaskNodes(client, {
    googleTasksId: {
      in: googleTasks.map((googleTask) => googleTask.id),
    },
    or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
  });

  return partitionTasks(googleTasks, nodes, listId);
};
