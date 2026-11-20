import { isNonEmptyArray } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { findGranolaPersonalConnection } from 'src/logic-functions/utils/find-granola-personal-connection.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';

export const loadGranolaPersonalSync = async ({
  connectionId,
  userWorkspaceId,
  apiKeyFingerprint,
}: GranolaPersonalSyncScope & { apiKeyFingerprint: string }) => {
  const connection = await findGranolaPersonalConnection({
    connectionId,
    userWorkspaceId,
  });

  if (!isDefined(connection)) {
    return undefined;
  }

  const currentFingerprint = getGranolaApiKeyFingerprint(
    connection.accessToken,
  );

  if (apiKeyFingerprint !== currentFingerprint) {
    return undefined;
  }

  const selection = await kv.get<GranolaPersonalFolderSelection[]>(
    getGranolaPersonalFolderSelectionKey(connectionId),
  );

  if (!isNonEmptyArray(selection)) {
    return undefined;
  }

  return {
    selection,
    apiKey: connection.accessToken,
    apiKeyFingerprint: currentFingerprint,
  };
};
