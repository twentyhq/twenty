import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
} from 'twenty-sdk/logic-function';
import { z } from 'zod';

import { GRANOLA_NOTE_ID_PATTERN } from 'src/constants/granola-api.constant';
import { GRANOLA_SYNC_NOTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GRANOLA_NOT_CONNECTED_ERROR_MESSAGE } from 'src/logic-functions/constants/granola-not-connected-error-message.constant';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { isGranolaApiKeySet } from 'src/logic-functions/utils/is-granola-api-key-set.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';

const GRANOLA_SYNC_NOTE_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    noteId: {
      type: 'string',
      label: 'Granola note ID',
      description: 'The not_ identifier returned by List Granola Notes.',
    },
  },
  required: ['noteId'],
  additionalProperties: false,
};
const GRANOLA_SYNC_NOTE_PARAMETERS_SCHEMA = z.object({
  noteId: z.string().regex(GRANOLA_NOTE_ID_PATTERN),
});

export const granolaSyncNoteHandler = async (parameters: unknown) => {
  const parsed = GRANOLA_SYNC_NOTE_PARAMETERS_SCHEMA.safeParse(parameters);

  if (!parsed.success) {
    return { success: false, error: 'A valid Granola note ID is required.' };
  }

  if (!isGranolaApiKeySet()) {
    return { success: false, error: GRANOLA_NOT_CONNECTED_ERROR_MESSAGE };
  }

  const result = await syncGranolaNoteToCallRecordingOrThrow({
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    client: createGranolaClientOrThrow(),
    noteId: parsed.data.noteId,
  });

  return { success: true, noteId: parsed.data.noteId, ...result };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_SYNC_NOTE_UNIVERSAL_IDENTIFIER,
  name: 'granola-sync-note',
  description:
    'Sync one accessible Granola note into a Call Recording with its transcript and summary. Uses the workspace API key and preserves recordings deleted in Twenty.',
  timeoutSeconds: 900,
  handler: granolaSyncNoteHandler,
  toolTriggerSettings: { inputSchema: GRANOLA_SYNC_NOTE_INPUT_SCHEMA },
  workflowActionTriggerSettings: {
    label: 'Sync Granola Note',
    inputSchema: jsonSchemaToInputSchema(GRANOLA_SYNC_NOTE_INPUT_SCHEMA),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          noteId: { type: 'string' },
          callRecordingId: { type: 'string' },
          calendarEventId: { type: 'string' },
          created: { type: 'boolean' },
          skipped: { type: 'boolean' },
        },
      },
    ],
  },
});
