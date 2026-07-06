import { defineLogicFunction } from 'twenty-sdk/define';

import { type TargetObject } from 'src/constants/target-objects';
import {
  createNoteForTarget,
  type CreateNoteInput,
} from 'src/logic-functions/utils/create-note-core';

type LogicFunctionConfig = Parameters<typeof defineLogicFunction>[0];

// Builds the config for one create-note logic function bound to a single
// object. Each object needs its own function because a record input binds to
// exactly one object's universalIdentifier, which is what makes the workflow
// builder render a record picker. The manifest build only recognises a function
// from a direct `defineLogicFunction(...)` default export, so callers wrap this.
export const buildCreateNoteConfig = ({
  universalIdentifier,
  target,
}: {
  universalIdentifier: string;
  target: TargetObject;
}): LogicFunctionConfig => ({
  universalIdentifier,
  name: `create-note-for-${target.name}`,
  description: `Create a Note linked to a ${target.label} in one step. Provide a title and the ${target.label} to attach it to; optionally set body.`,
  timeoutSeconds: 30,
  handler: (input: CreateNoteInput) =>
    createNoteForTarget(input, target.targetFieldName),
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The note title.' },
        body: {
          type: 'string',
          description: 'Optional note body (Markdown supported).',
        },
        targetRecordId: {
          type: 'string',
          description: `Id of the ${target.label} record to attach the note to.`,
        },
      },
      required: ['title', 'targetRecordId'],
      additionalProperties: false,
    },
  },
  workflowActionTriggerSettings: {
    label: `Create Note for ${target.label}`,
    inputSchema: [
      {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string', multiline: true },
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
          noteId: { type: 'string' },
          noteTargetId: { type: 'string' },
          error: { type: 'string' },
        },
      },
    ],
  },
});
