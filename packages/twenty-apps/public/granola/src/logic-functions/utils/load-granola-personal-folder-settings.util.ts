import { isNonEmptyString } from '@sniptt/guards';
import { kv, reportConnectionAuthFailure } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';
import { listGranolaPersonalConnections } from 'src/logic-functions/utils/list-granola-personal-connections.util';

export const loadGranolaPersonalFolderSettings = async ({
  connectionId,
  userWorkspaceId,
}: {
  connectionId: string;
  userWorkspaceId: string;
}) => {
  const connections = await listGranolaPersonalConnections(userWorkspaceId);
  const connection = connections.find(({ id }) => id === connectionId);

  if (
    !isDefined(connection) ||
    isDefined(connection.authFailedAt) ||
    !isNonEmptyString(connection.accessToken)
  ) {
    return undefined;
  }

  const client = createGranolaClientOrThrow({ apiKey: connection.accessToken });
  const selectionKey = getGranolaPersonalFolderSelectionKey(connection.id);

  try {
    const folders = await listAllGranolaFoldersOrThrow({ client });
    const selection =
      (await kv.get<GranolaPersonalFolderSelection[]>(selectionKey)) ?? [];

    return { folders, selectionKey, selection };
  } catch (error) {
    if (error instanceof GranolaApiError && error.status === 401) {
      await reportConnectionAuthFailure({ connectionId: connection.id });

      return undefined;
    }

    throw error;
  }
};
