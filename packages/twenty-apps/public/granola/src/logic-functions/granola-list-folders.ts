import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PAGE_PARAMETERS_INPUT_SCHEMA } from 'src/constants/granola-page-parameters.constant';
import { GRANOLA_LIST_FOLDERS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GRANOLA_NOT_CONNECTED_ERROR_MESSAGE } from 'src/logic-functions/constants/granola-not-connected-error-message.constant';
import { GRANOLA_PAGE_PARAMETERS_SCHEMA } from 'src/logic-functions/schemas/granola-page-parameters.schema';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { isGranolaApiKeySet } from 'src/logic-functions/utils/is-granola-api-key-set.util';

const GRANOLA_LIST_FOLDERS_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: GRANOLA_PAGE_PARAMETERS_INPUT_SCHEMA,
  additionalProperties: false,
};

export const granolaListFoldersHandler = async (parameters: unknown) => {
  const parsed = GRANOLA_PAGE_PARAMETERS_SCHEMA.safeParse(parameters);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Use a limit between 1 and 30 and a valid pagination cursor.',
    };
  }

  if (!isGranolaApiKeySet()) {
    return { success: false, error: GRANOLA_NOT_CONNECTED_ERROR_MESSAGE };
  }

  const page = await createGranolaClientOrThrow().listFolders({
    cursor: parsed.data.cursor,
    page_size: parsed.data.limit,
  });

  return {
    success: true,
    folders: page.folders.map(({ id, name, parent_folder_id }) => ({
      id,
      name,
      parentFolderId: parent_folder_id,
    })),
    hasMore: page.hasMore,
    ...(isDefined(page.cursor) ? { cursor: page.cursor } : {}),
  };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_LIST_FOLDERS_UNIVERSAL_IDENTIFIER,
  name: 'granola-list-folders',
  description:
    'Lists a page of accessible Granola folders. Pass a folder ID to List Granola Notes; use the cursor to read more folders.',
  timeoutSeconds: 30,
  handler: granolaListFoldersHandler,
  toolTriggerSettings: { inputSchema: GRANOLA_LIST_FOLDERS_INPUT_SCHEMA },
});
