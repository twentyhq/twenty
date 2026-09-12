import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type InputJsonSchema,
  jsonSchemaToInputSchema,
} from 'twenty-sdk/logic-function';
import { z } from 'zod';

import { GRANOLA_LIST_NOTES_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GRANOLA_FOLDER_ID_PATTERN } from 'src/constants/granola-api.constant';
import { GRANOLA_PAGE_PARAMETERS_INPUT_SCHEMA } from 'src/constants/granola-page-parameters.constant';
import { GRANOLA_NOT_CONNECTED_ERROR_MESSAGE } from 'src/logic-functions/constants/granola-not-connected-error-message.constant';
import { GRANOLA_PAGE_PARAMETERS_SCHEMA } from 'src/logic-functions/schemas/granola-page-parameters.schema';
import { GRANOLA_DATE_TIME_SCHEMA } from 'src/logic-functions/types/granola-api.type';
import { isGranolaApiKeySet } from 'src/logic-functions/utils/is-granola-api-key-set.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { isDefined } from 'twenty-sdk/utils';

const GRANOLA_LIST_NOTES_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    folderId: {
      type: 'string',
      label: 'Folder ID',
      description: 'An optional fol_ identifier; includes subfolders.',
    },
    createdAfter: {
      type: 'string',
      label: 'Created after',
      description: 'An ISO date or date-time.',
    },
    createdBefore: {
      type: 'string',
      label: 'Created before',
      description: 'An ISO date or date-time.',
    },
    ...GRANOLA_PAGE_PARAMETERS_INPUT_SCHEMA,
  },
  additionalProperties: false,
};
const GRANOLA_DATE_FILTER_SCHEMA = z.union([
  z.iso.date(),
  GRANOLA_DATE_TIME_SCHEMA,
]);
const GRANOLA_LIST_NOTES_PARAMETERS_SCHEMA =
  GRANOLA_PAGE_PARAMETERS_SCHEMA.extend({
    folderId: z.string().regex(GRANOLA_FOLDER_ID_PATTERN).optional(),
    createdAfter: GRANOLA_DATE_FILTER_SCHEMA.optional(),
    createdBefore: GRANOLA_DATE_FILTER_SCHEMA.optional(),
  });

export const granolaListNotesHandler = async (parameters: unknown) => {
  const parsed = GRANOLA_LIST_NOTES_PARAMETERS_SCHEMA.safeParse(parameters);

  if (!parsed.success) {
    return {
      success: false,
      error:
        'Use valid date filters, a Granola folder ID, and a limit between 1 and 30.',
    };
  }

  if (!isGranolaApiKeySet()) {
    return { success: false, error: GRANOLA_NOT_CONNECTED_ERROR_MESSAGE };
  }

  const page = await createGranolaClientOrThrow().listNotes({
    folder_id: parsed.data.folderId,
    created_after: parsed.data.createdAfter,
    created_before: parsed.data.createdBefore,
    cursor: parsed.data.cursor,
    page_size: parsed.data.limit,
  });
  const notes = page.notes.map((note) => ({
    id: note.id,
    ...(isDefined(note.title) ? { title: note.title } : {}),
    owner: {
      email: note.owner.email,
      ...(isDefined(note.owner.name) ? { name: note.owner.name } : {}),
    },
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  }));

  return {
    success: true,
    notes,
    hasMore: page.hasMore,
    ...(isDefined(page.cursor) ? { cursor: page.cursor } : {}),
  };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_LIST_NOTES_UNIVERSAL_IDENTIFIER,
  name: 'granola-list-notes',
  description:
    'Lists a page of Granola note IDs, titles, owners and dates using the workspace key. Filter by folder or date; pass a returned ID to Sync Granola Note to import its transcript and summary.',
  timeoutSeconds: 30,
  handler: granolaListNotesHandler,
  toolTriggerSettings: { inputSchema: GRANOLA_LIST_NOTES_INPUT_SCHEMA },
  workflowActionTriggerSettings: {
    label: 'List Granola Notes',
    inputSchema: jsonSchemaToInputSchema(GRANOLA_LIST_NOTES_INPUT_SCHEMA),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          hasMore: { type: 'boolean' },
          cursor: { type: 'string' },
          notes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                owner: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    ],
  },
});
