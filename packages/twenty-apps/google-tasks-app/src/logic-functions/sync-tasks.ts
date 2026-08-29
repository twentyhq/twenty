import { defineLogicFunction } from 'twenty-sdk/define';
import axios from 'axios';
import { listConnections } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { findTask } from "src/logic-functions/data/find-task.util";
import { createTask } from "src/logic-functions/data/create-task.util";
import { deleteTask } from "src/logic-functions/data/delete-task.util";
import { updateTask } from "src/logic-functions/data/update-task.util";
import { taskListsResponse, tasksResponse } from "src/logic-functions/types";

const BASE_API_URL = 'https://tasks.googleapis.com';

const handler = async () => {
  const connections = await listConnections({ providerName: 'google-tasks' });
  const connection = connections.find((c) => c.visibility === 'user');
  console.log(connection);
  if (!connection) {
    return {
      success: false,
      error: 'Missing personal sync connection',
    };
  }
  const client = new CoreApiClient();
  const workspaceMemberId = connection.workspaceMemberId;
  if (workspaceMemberId === null) {
    return {
      success: false,
      error: 'Missing workspaceMemberId',
    }
  }
  const axiosInstance = axios.create({
    baseURL: BASE_API_URL,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${connection.accessToken}`,
    },
  });

  const listsResponse = await axiosInstance.get<taskListsResponse>('/tasks/v1/users/@me/lists');

  if (!listsResponse || listsResponse.data === null) {
    return {
      success: false,
      error: 'Failed to fetch lists',
    };
  }

  const taskLists = listsResponse.data;
  for (const list of taskLists.items) {
    const googleTasksResponse = await axiosInstance.get<tasksResponse>(
      `/tasks/v1/lists/${list.id}/tasks`,
    );

    if (!googleTasksResponse || googleTasksResponse.data == null) {
      continue;
    }

    const tasks = googleTasksResponse.data;
    for (const task of tasks.items) {
      const checkTask = await findTask(client, task.id);
      console.log(task);
      if (checkTask.tasks?.edges.length === 0 && task.deleted === undefined) {
        await createTask(client, workspaceMemberId, task.id, task.title, task.notes, task.due, task.completed);
      } else {
        if (task.deleted) {
          await deleteTask(client, task.id);
        } else {
          if (
            task.title !== checkTask.tasks?.edges[0].node.title ||
            (task.notes ?? null) !== checkTask.tasks?.edges[0].node.bodyV2?.markdown ||
            (task.due ?? null) !== checkTask.tasks?.edges[0].node.dueAt ||
            ((task.completed && checkTask.tasks?.edges[0].node.status !== 'DONE') ||
              (!task.completed) && checkTask.tasks?.edges[0].node.status === 'TODO')
          ) {
            await updateTask(client, task.id, task.title, task.notes, task.due, task.completed);
          }
        }
      }
    }
  }

  return {
    success: true,
  }
};

export default defineLogicFunction({
  universalIdentifier: 'e35d95c3-655b-46e6-ab58-f985ea429717',
  name: 'sync-tasks',
  description: 'Syncs tasks from Google',
  timeoutSeconds: 900,
  handler,
  cronTriggerSettings: {
    pattern: '*/15 * * * *',
  },
});
