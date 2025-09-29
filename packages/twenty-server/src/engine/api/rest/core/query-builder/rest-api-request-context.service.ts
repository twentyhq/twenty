import { BadRequestException, Injectable } from '@nestjs/common';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { AuthenticatedRequest } from 'src/engine/api/rest/core/interfaces/authenticated-request.interface';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNamePlural } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-plural.util';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { shouldExcludeFromWorkspaceApi } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/should-exclude-from-workspace-api.util';

@Injectable()
export class RestApiRequestContextService {
  constructor(
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  private async getRoleId(request: AuthenticatedRequest) {
    const { workspace, apiKey, userWorkspaceId } = request;

    if (isDefined(apiKey)) {
      const apiKeyRoleId = await this.apiKeyRoleService.getRoleIdForApiKey(
        apiKey.id,
        workspace.id,
      );

      if (!isDefined(apiKeyRoleId)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.API_KEY_ROLE_NOT_FOUND,
          PermissionsExceptionCode.API_KEY_ROLE_NOT_FOUND,
        );
      }

      return apiKeyRoleId;
    }

    const userWorkspaceRoleId =
      await this.workspacePermissionsCacheService.getRoleIdFromUserWorkspaceId({
        workspaceId: workspace.id,
        userWorkspaceId,
      });

    if (!isDefined(userWorkspaceRoleId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      );
    }

    return userWorkspaceRoleId;
  }

  public async getObjectMetadata(
    request: AuthenticatedRequest,
    parsedObject: string,
  ): Promise<{
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
  }> {
    const { workspace } = request;

    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspace.id);

    if (currentCacheVersion === undefined) {
      await this.workspaceMetadataCacheService.recomputeMetadataCache({
        workspaceId: workspace.id,
      });

      throw new BadRequestException('Metadata cache version not found');
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspace.id,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new BadRequestException(
        `No object was found for the workspace associated with this API key. You may generate a new one here ${this.domainManagerService
          .buildWorkspaceURL({
            workspace,
            pathname: getSettingsPath(SettingsPath.ApiWebhooks),
          })
          .toString()}`,
      );
    }

    const objectMetadataItem = getObjectMetadataMapItemByNamePlural(
      objectMetadataMaps,
      parsedObject,
    );

    if (!objectMetadataItem) {
      const wrongObjectMetadataItem = getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        parsedObject,
      );

      let hint = 'eg: companies';

      if (wrongObjectMetadataItem) {
        hint = `Did you mean '${wrongObjectMetadataItem.namePlural}'?`;
      }

      throw new BadRequestException(
        `object '${parsedObject}' not found. ${hint}`,
      );
    }

    const workspaceFeatureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspace.id);

    // Check if this entity is workspace-gated and should be blocked from workspace API
    if (
      shouldExcludeFromWorkspaceApi(
        objectMetadataItem,
        standardObjectMetadataDefinitions,
        workspaceFeatureFlagsMap,
      )
    ) {
      throw new BadRequestException(
        `object '${parsedObject}' not found. ${parsedObject} is not available via REST API.`,
      );
    }

    return {
      objectMetadataMaps,
      objectMetadataMapItem: objectMetadataItem,
    };
  }

  public async getObjectsRecordPermissions(request: AuthenticatedRequest) {
    const { workspace } = request;

    const roleId = await this.getRoleId(request);

    const objectMetadataPermissions =
      await this.workspacePermissionsCacheService.getObjectRecordPermissionsForRoles(
        {
          workspaceId: workspace.id,
          roleIds: roleId ? [roleId] : undefined,
        },
      );

    if (!isDefined(objectMetadataPermissions?.[roleId])) {
      throw new InternalServerError('Permissions not found for role');
    }

    return objectMetadataPermissions?.[roleId];
  }

  public async getRepositoryAndMetadataOrFail(request: AuthenticatedRequest) {
    const { object: parsedObject } = parseCorePath(request);

    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    if (!objectMetadata) {
      throw new BadRequestException('Object metadata not found');
    }

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadata.objectMetadataMaps,
        objectMetadataNameSingular,
      );

    if (!isDefined(objectMetadataItemWithFieldsMaps)) {
      throw new BadRequestException(
        `Object metadata item with name singular ${objectMetadataNameSingular} not found`,
      );
    }

    const roleId = await this.getRoleId(request);

    const repository = workspaceDataSource.getRepository<ObjectRecord>(
      objectMetadataNameSingular,
      false,
      roleId,
    );

    return {
      objectMetadata,
      repository,
      workspaceDataSource,
      objectMetadataItemWithFieldsMaps,
    };
  }

  public getAuthContextFromRequest(request: AuthenticatedRequest): AuthContext {
    return {
      user: request.user,
      workspace: request.workspace,
      apiKey: request.apiKey,
      workspaceMemberId: request.workspaceMemberId,
      userWorkspaceId: request.userWorkspaceId,
    };
  }
}
