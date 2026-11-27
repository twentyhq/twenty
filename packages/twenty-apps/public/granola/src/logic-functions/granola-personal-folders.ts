import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  Response,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import { GRANOLA_PERSONAL_FOLDERS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_FOLDERS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { loadGranolaPersonalFolders } from 'src/logic-functions/utils/load-granola-personal-folders.util';

export const granolaPersonalFoldersHandler = async (
  payload: Pick<RoutePayload<unknown>, 'queryStringParameters'>,
  { userWorkspaceId }: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
) => {
  if (!isDefined(userWorkspaceId)) {
    return new Response({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
  }

  const connectionId = z
    .uuid()
    .safeParse(payload.queryStringParameters?.connectionId);

  if (!connectionId.success) {
    return new Response({ error: 'INVALID_CONNECTION_ID' }, { status: 400 });
  }

  const personalFolders = await loadGranolaPersonalFolders({
    connectionId: connectionId.data,
    userWorkspaceId,
  });

  if (!isDefined(personalFolders)) {
    return new Response({ error: 'CONNECTION_UNAVAILABLE' }, { status: 404 });
  }

  return { success: true, ...personalFolders };
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
