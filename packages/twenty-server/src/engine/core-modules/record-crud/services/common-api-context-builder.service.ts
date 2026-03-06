import { Injectable } from '@nestjs/common';

import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAllSelectableFields } from 'src/engine/api/common/common-select-fields/utils/get-all-selectable-fields.util';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  RecordCrudException,
  RecordCrudExceptionCode,
} from 'src/engine/core-modules/record-crud/exceptions/record-crud.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type CommonApiContext = {
  queryRunnerContext: CommonBaseQueryRunnerContext;
  selectedFields: CommonSelectedFields;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectsPermissions: ObjectsPermissions;
};

@Injectable()
export class CommonApiContextBuilderService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly userRoleService: UserRoleService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  async build({
    authContext,
    objectName,
  }: {
    authContext: WorkspaceAuthContext;
    objectName: string;
  }): Promise<CommonApiContext> {
    const workspaceId = authContext.workspace.id;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    if (!isDefined(flatObjectMetadataMaps)) {
      throw new RecordCrudException(
        'Object metadata not found for workspace',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );
    const objectId = idByNameSingular[objectName];

    if (!isDefined(objectId)) {
      throw new RecordCrudException(
        `Object ${objectName} not found`,
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new RecordCrudException(
        `Object metadata for ${objectName} not found`,
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const objectsPermissions = await this.getObjectsPermissions(authContext);

    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id]?.restrictedFields ?? {};

    const selectedFields = getAllSelectableFields({
      restrictedFields,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    return {
      queryRunnerContext: {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular: idByNameSingular,
      },
      selectedFields,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectsPermissions,
    };
  }

  private async getObjectsPermissions(
    authContext: WorkspaceAuthContext,
  ): Promise<ObjectsPermissions> {
    const workspaceId = authContext.workspace.id;
    let roleId: string;

    if (isApiKeyAuthContext(authContext)) {
      roleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
        authContext.apiKey.id,
        workspaceId,
      );
    } else if (
      isApplicationAuthContext(authContext) &&
      isDefined(authContext.application.defaultRoleId)
    ) {
      roleId = authContext.application.defaultRoleId;
    } else if (isUserAuthContext(authContext)) {
      const userWorkspaceRoleId =
        await this.userRoleService.getRoleIdForUserWorkspace({
          userWorkspaceId: authContext.userWorkspaceId,
          workspaceId,
        });

      if (!isDefined(userWorkspaceRoleId)) {
        throw new RecordCrudException(
          'No role found for user workspace',
          RecordCrudExceptionCode.INVALID_REQUEST,
        );
      }

      roleId = userWorkspaceRoleId;
    } else {
      throw new RecordCrudException(
        'Invalid auth context - no authentication mechanism found',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    return rolesPermissions[roleId] ?? {};
  }
}
