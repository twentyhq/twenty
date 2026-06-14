import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CREATE_TASK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildTargetFieldName } from 'src/utils/build-target-field-name';

type CreateTaskInput = {
  title?: string;
  body?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueAt?: string;
  assigneeId?: string;
  targetObject?: string;
  targetRecordId?: string;
};

type CreateTaskResult =
  | { success: true; taskId: string; taskTargetId?: string }
  | { success: false; error: string };

const handler = async (input: CreateTaskInput): Promise<CreateTaskResult> => {
  if (!input.title) {
    return { success: false, error: '`title` is required.' };
  }

  if (
    (input.targetObject && !input.targetRecordId) ||
    (!input.targetObject && input.targetRecordId)
  ) {
    return {
      success: false,
      error:
        'Provide both `targetObject` and `targetRecordId` to link the task, or neither.',
    };
  }

  const client = new CoreApiClient();

  const taskResult = await client.mutation({
    createTask: {
      __args: {
        data: {
          title: input.title,
          bodyV2: { markdown: input.body ?? '' },
          status: input.status ?? 'TODO',
          ...(input.dueAt ? { dueAt: input.dueAt } : {}),
          ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
        },
      },
      id: true,
    },
  } as any);

  const taskId = (taskResult as any).createTask.id as string;

  if (!input.targetObject || !input.targetRecordId) {
    return { success: true, taskId };
  }

  const targetFieldName = buildTargetFieldName(input.targetObject);

  const taskTargetResult = await client.mutation({
    createTaskTarget: {
      __args: {
        data: {
          taskId,
          [targetFieldName]: input.targetRecordId,
        },
      },
      id: true,
    },
  } as any);

  const taskTargetId = (taskTargetResult as any).createTaskTarget.id as string;

  return { success: true, taskId, taskTargetId };
};

export default defineLogicFunction({
  universalIdentifier: CREATE_TASK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'create-task',
  description:
    'Create a Task and optionally link it to a record in one step. Provide a title; optionally set body, status (TODO, IN_PROGRESS, DONE), dueAt and assigneeId. To attach the task to a record, pass targetObject (the singular object name, e.g. person, company, opportunity) and targetRecordId.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The task title.' },
        body: {
          type: 'string',
          description: 'Optional task body (Markdown supported).',
        },
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'DONE'],
          description: 'Task status. Defaults to TODO.',
        },
        dueAt: {
          type: 'string',
          description: 'Optional due date in ISO 8601 format.',
        },
        assigneeId: {
          type: 'string',
          description: 'Optional workspace member id to assign the task to.',
        },
        targetObject: {
          type: 'string',
          description:
            'Singular object name to attach the task to (e.g. person, company, opportunity, or a custom object). Requires targetRecordId.',
        },
        targetRecordId: {
          type: 'string',
          description: 'Id of the record to attach the task to.',
        },
      },
      required: ['title'],
      additionalProperties: false,
    },
  },
  workflowActionTriggerSettings: {
    label: 'Create Task',
    inputSchema: [
      {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string', multiline: true },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          dueAt: { type: 'string' },
          assigneeId: { type: 'string' },
          targetObject: { type: 'string' },
          targetRecordId: { type: 'string' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          taskId: { type: 'string' },
          taskTargetId: { type: 'string' },
          error: { type: 'string' },
        },
      },
    ],
  },
});
