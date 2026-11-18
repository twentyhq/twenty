import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  listConnections,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
  GRANOLA_PERSONAL_SETTINGS_ROUTE_PATH,
} from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_SETTINGS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { getGranolaSelectedParentFolders } from 'src/logic-functions/utils/get-granola-selected-parent-folders.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';
import { GRANOLA_PERSONAL_SETTINGS_REQUEST_SCHEMA } from 'src/types/granola-personal-settings-request.type';

export const granolaPersonalSettingsHandler = async (
  payload: RoutePayload<unknown>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
) => {
  const request = GRANOLA_PERSONAL_SETTINGS_REQUEST_SCHEMA.safeParse(
    payload.body,
  );

  if (!request.success || !isDefined(context.userWorkspaceId)) {
    return {
      success: false,
      error: 'Invalid personal Granola settings request.',
    };
  }

  const { data } = request;
  const ownedConnections = (
    await listConnections({
      providerName: GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
      scope: 'USER',
      userWorkspaceId: context.userWorkspaceId,
    })
  ).filter(
    (connection) =>
      connection.providerName === GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME &&
      connection.scope === 'USER' &&
      connection.userWorkspaceId === context.userWorkspaceId,
  );

  if (data.action === 'list-connections') {
    return {
      success: true,
      connections: ownedConnections.map(({ id, name }) => ({ id, name })),
    };
  }

  const connection = ownedConnections.find(
    ({ id }) => id === data.connectionId,
  );

  if (
    !isDefined(connection) ||
    connection.authFailedAt !== null ||
    !isNonEmptyString(connection.accessToken)
  ) {
    return {
      success: false,
      error: 'Connect your Granola account in General.',
    };
  }

  const client = createGranolaClientOrThrow({ apiKey: connection.accessToken });
  let folders;

  try {
    folders = await listAllGranolaFoldersOrThrow({ client });
  } catch (error) {
    if (error instanceof GranolaApiError && error.status === 401) {
      return {
        success: false,
        error: 'Reconnect Granola in General to use a valid key.',
      };
    }

    throw error;
  }

  const selectionKey = getGranolaPersonalFolderSelectionKey(connection.id);
  const selection =
    (await kv.get<GranolaPersonalFolderSelection[]>(selectionKey)) ?? [];
  const accessibleFolderIds = new Set(folders.map(({ id }) => id));

  if (data.action === 'list-folders') {
    return {
      success: true,
      folders,
      folderIds: selection
        .map(({ folderId }) => folderId)
        .filter((folderId) => accessibleFolderIds.has(folderId)),
    };
  }

  if (data.folderIds.some((folderId) => !accessibleFolderIds.has(folderId))) {
    return {
      success: false,
      error: 'A selected folder is not accessible to this key.',
    };
  }

  const folderIds = getGranolaSelectedParentFolders({
    folderIds: data.folderIds,
    folders,
  });
  const selectedAtByFolderId = new Map(
    selection.map(({ folderId, selectedAt }) => [folderId, selectedAt]),
  );
  const selectedAt = new Date().toISOString();

  await kv.set(
    selectionKey,
    folderIds.map((folderId) => ({
      folderId,
      selectedAt: selectedAtByFolderId.get(folderId) ?? selectedAt,
    })),
  );

  return { success: true, folderIds };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_SETTINGS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-settings',
  description:
    'Reads and saves folder preferences for the member’s own Granola connections.',
  timeoutSeconds: 60,
  handler: granolaPersonalSettingsHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_PERSONAL_SETTINGS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
