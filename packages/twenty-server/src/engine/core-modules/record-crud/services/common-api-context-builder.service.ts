import { Injectable } from '@nestjs/common';

import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildFieldSelection } from 'src/engine/api/common/common-select-fields/utils/build-field-selection.util';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
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
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';
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
  ) {}

  async build({
    authContext,
    objectName,
    rolePermissionConfig,
  }: {
    authContext: WorkspaceAuthContext;
    objectName: string;
    rolePermissionConfig?: RolePermissionConfig;
  }): Promise<CommonApiContext> {
    const workspaceId = authContext.workspace.id;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatIndexMaps',
          ],
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

    const objectsPermissions = await this.getObjectsPermissions({
      authContext,
      rolePermissionConfig,
    });

    const restrictedFields =
      objectsPermissions[flatObjectMetadata.id]?.restrictedFields ?? {};

    const selectedFields = buildFieldSelection({
      restrictedFields,
      flatObjectMetadata,
      flatFields: findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: flatObjectMetadata.fieldIds,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    });

    return {
      queryRunnerContext: {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
        objectIdByNameSingular: idByNameSingular,
        rolePermissionConfig,
      },
      selectedFields,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectsPermissions,
    };
  }

  private async getObjectsPermissions({
    authContext,
    rolePermissionConfig,
  }: {
    authContext: WorkspaceAuthContext;
    rolePermissionConfig?: RolePermissionConfig;
  }): Promise<ObjectsPermissions> {
    const {
      rolesPermissions,
      flatObjectMetadataMaps,
      flatApplicationMaps,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
    } = await this.workspaceCacheService.getOrRecompute(
      authContext.workspace.id,
      [
        'rolesPermissions',
        'flatObjectMetadataMaps',
        'flatApplicationMaps',
        'userWorkspaceRoleMap',
        'apiKeyRoleMap',
        'flatRoleTargetByAgentIdMaps',
      ],
    );

    const resolvedRolePermissionConfig =
      rolePermissionConfig ??
      resolveRolePermissionConfig({
        authContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        flatRoleTargetByAgentIdMaps,
      });

    if (!isDefined(resolvedRolePermissionConfig)) {
      throw new RecordCrudException(
        'No role found for this auth context',
        RecordCrudExceptionCode.INVALID_REQUEST,
      );
    }

    return getObjectsPermissionsFromRolePermissionConfig({
      rolesPermissions,
      rolePermissionConfig: resolvedRolePermissionConfig,
      flatObjectMetadataMaps,
      flatApplicationMaps,
    });
  }
}
