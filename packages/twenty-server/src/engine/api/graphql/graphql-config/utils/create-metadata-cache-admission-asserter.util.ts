import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { FIND_ALL_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-views-graphql-operation.constant';
import { type MetadataReadPermissionsService } from 'src/engine/permissions/metadata-permissions/services/metadata-read-permissions.service';

export const createMetadataCacheAdmissionAsserter =
  (metadataReadPermissionsService: MetadataReadPermissionsService) =>
  async ({
    operationName,
    request,
  }: {
    operationName: string;
    request: Request;
  }): Promise<void> => {
    const workspaceId = request.workspace?.id;

    if (
      operationName !== FIND_ALL_VIEWS_GRAPHQL_OPERATION ||
      !isDefined(workspaceId)
    ) {
      throw new Error(
        `No cache admission is defined for operation "${operationName}"`,
      );
    }

    await metadataReadPermissionsService.getViewReadPredicate({
      workspaceId,
      authContext: workspaceAuthContextStorage.getStore(),
    });
  };
