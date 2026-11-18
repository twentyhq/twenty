import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import { GRANOLA_PERSONAL_FOLDERS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_FOLDERS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { loadGranolaPersonalFolderSettings } from 'src/logic-functions/utils/load-granola-personal-folder-settings.util';

export const granolaPersonalFoldersHandler = async (
  payload: RoutePayload<unknown>,
  { userWorkspaceId }: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
) => {
  const connectionId = z
    .uuid()
    .safeParse(payload.queryStringParameters?.connectionId);

  if (!connectionId.success || !isDefined(userWorkspaceId)) {
    return { success: false };
  }

  const settings = await loadGranolaPersonalFolderSettings({
    connectionId: connectionId.data,
    userWorkspaceId,
  });

  if (!isDefined(settings)) {
    return { success: false };
  }

  const { folders, selection } = settings;
  const availableFolders = new Set(folders.map(({ id }) => id));

  return {
    success: true,
    folders,
    folderIds: selection
      .map(({ folderId }) => folderId)
      .filter((folderId) => availableFolders.has(folderId)),
  };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_FOLDERS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-folders',
  description: 'Lists accessible Granola folders and the selected folders.',
  timeoutSeconds: 60,
  handler: granolaPersonalFoldersHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_PERSONAL_FOLDERS_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
