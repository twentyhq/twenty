import { defineLogicFunction } from 'twenty-sdk/define';

import { type TargetObject } from 'src/constants/target-objects';
import {
  createTaskForTarget,
  type CreateTaskInput,
} from 'src/logic-functions/utils/create-task-core';

type LogicFunctionConfig = Parameters<typeof defineLogicFunction>[0];

// Builds the config for one create-task logic function bound to a single
// object. Each object needs its own function because a record input binds to
// exactly one object's universalIdentifier, which is what makes the workflow
// builder render a record picker. The manifest build only recognises a function
// from a direct `defineLogicFunction(...)` default export, so callers wrap this.
export const buildCreateTaskConfig = ({
  universalIdentifier,
  target,
}: {
  universalIdentifier: string;
  target: TargetObject;
}): LogicFunctionConfig => ({
  universalIdentifier,
  name: `create-task-for-${target.name}`,
  description: `Create a Task linked to a ${target.label} in one step. Provide a title and the ${target.label} to attach it to; optionally set body, status (TODO, IN_PROGRESS, DONE), dueAt and assigneeId.`,
  timeoutSeconds: 30,
  handler: (input: CreateTaskInput) =>
    createTaskForTarget(input, target.targetFieldName),
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
        targetRecordId: {
          type: 'string',
          description: `Id of the ${target.label} record to attach the task to.`,
        },
      },
      required: ['title', 'targetRecordId'],
      additionalProperties: false,
    },
  },
  workflowActionTriggerSettings: {
    label: `Create Task for ${target.label}`,
    inputSchema: [
      {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string', multiline: true },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          dueAt: { type: 'string' },
          assigneeId: { type: 'string' },
          targetRecordId: {
            type: 'record',
            objectUniversalIdentifier: target.objectUniversalIdentifier,
            label: target.label,
          },
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
