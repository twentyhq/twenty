import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CREATE_NOTE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildTargetFieldName } from 'src/utils/build-target-field-name';

type CreateNoteInput = {
  title?: string;
  body?: string;
  targetObject?: string;
  targetRecordId?: string;
};

type CreateNoteResult =
  | { success: true; noteId: string; noteTargetId?: string }
  | { success: false; error: string };

const handler = async (input: CreateNoteInput): Promise<CreateNoteResult> => {
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
        'Provide both `targetObject` and `targetRecordId` to link the note, or neither.',
    };
  }

  const client = new CoreApiClient();

  const noteResult = await client.mutation({
    createNote: {
      __args: {
        data: {
          title: input.title,
          bodyV2: { markdown: input.body ?? '' },
        },
      },
      id: true,
    },
  } as any);

  const noteId = (noteResult as any).createNote.id as string;

  if (!input.targetObject || !input.targetRecordId) {
    return { success: true, noteId };
  }

  const targetFieldName = buildTargetFieldName(input.targetObject);

  const noteTargetResult = await client.mutation({
    createNoteTarget: {
      __args: {
        data: {
          noteId,
          [targetFieldName]: input.targetRecordId,
        },
      },
      id: true,
    },
  } as any);

  const noteTargetId = (noteTargetResult as any).createNoteTarget.id as string;

  return { success: true, noteId, noteTargetId };
};

export default defineLogicFunction({
  universalIdentifier: CREATE_NOTE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'create-note',
  description:
    'Create a Note and optionally link it to a record in one step. Provide a title; optionally set body. To attach the note to a record, pass targetObject (the singular object name, e.g. person, company, opportunity) and targetRecordId.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The note title.' },
        body: {
          type: 'string',
          description: 'Optional note body (Markdown supported).',
        },
        targetObject: {
          type: 'string',
          description:
            'Singular object name to attach the note to (e.g. person, company, opportunity, or a custom object). Requires targetRecordId.',
        },
        targetRecordId: {
          type: 'string',
          description: 'Id of the record to attach the note to.',
        },
      },
      required: ['title'],
      additionalProperties: false,
    },
  },
  workflowActionTriggerSettings: {
    label: 'Create Note',
    inputSchema: [
      {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string', multiline: true },
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
          noteId: { type: 'string' },
          noteTargetId: { type: 'string' },
          error: { type: 'string' },
        },
      },
    ],
  },
});
