import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { listGranolaPersonalConnections } from 'src/logic-functions/utils/list-granola-personal-connections.util';

export const loadGranolaPersonalSync = async ({
  connectionId,
  userWorkspaceId,
  apiKeyFingerprint,
}: GranolaPersonalSyncScope & { apiKeyFingerprint?: string }) => {
  const selection = await kv.get<GranolaPersonalFolderSelection[]>(
    getGranolaPersonalFolderSelectionKey(connectionId),
  );

  if (!isDefined(selection) || selection.length === 0) {
    return undefined;
  }

  const connections = await listGranolaPersonalConnections(userWorkspaceId);
  const connection = connections.find(({ id }) => id === connectionId);

  if (
    !isDefined(connection) ||
    !isDefined(connection.workspaceMemberId) ||
    isDefined(connection.authFailedAt) ||
    !isNonEmptyString(connection.accessToken)
  ) {
    return undefined;
  }

  const currentFingerprint = getGranolaApiKeyFingerprint(
    connection.accessToken,
  );

  if (
    isDefined(apiKeyFingerprint) &&
    apiKeyFingerprint !== currentFingerprint
  ) {
    return undefined;
  }

  return {
    selection,
    apiKey: connection.accessToken,
    apiKeyFingerprint: currentFingerprint,
  };
};
