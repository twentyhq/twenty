import { BadRequestException, Inject } from '@nestjs/common';

import { SettingsPath } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { RestToCommonSelectedFieldsHandler } from 'src/engine/api/rest/core/rest-to-common-args-handlers/selected-fields-handler';
import { parseCorePath } from 'src/engine/api/rest/input-request-parsers/path-parser-utils/parse-core-path.utils';
import { Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { CreatedByFromAuthContextService } from 'src/engine/core-modules/actor/services/created-by-from-auth-context.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { getObjectMetadataMapItemByNamePlural } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-plural.util';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { shouldExcludeFromWorkspaceApi } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/should-exclude-from-workspace-api.util';

export interface PageInfo {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface FormatResult {
  data?: {
    [operation: string]: object;
  };
  pageInfo?: PageInfo;
  totalCount?: number;
}

export abstract class RestApiBaseHandler {
  @Inject()
  protected readonly twentyORMManager: TwentyORMManager;
  @Inject()
  protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService;
  @Inject()
  protected readonly createdByFromAuthContextService: CreatedByFromAuthContextService;
  @Inject()
  protected readonly workspaceCacheStorageService: WorkspaceCacheStorageService;
  @Inject()
  protected readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService;
  @Inject()
  protected readonly apiKeyRoleService: ApiKeyRoleService;
  @Inject()
  protected readonly restToCommonSelectedFieldsHandler: RestToCommonSelectedFieldsHandler;
  @Inject()
  protected readonly userRoleService: UserRoleService;
  @Inject()
  protected readonly accessTokenService: AccessTokenService;
  @Inject()
  protected readonly workspaceDomainsService: WorkspaceDomainsService;
  @Inject()
  protected readonly featureFlagService: FeatureFlagService;

  protected abstract handle(
    request: AuthenticatedRequest,
  ): Promise<
    FormatResult | { data: FormatResult[] } | CommonGroupByOutputItem[]
  >;

  public getAuthContextFromRequest(
    request: AuthenticatedRequest,
  ): WorkspaceAuthContext {
    return request;
  }

  private getObjectsPermissions = async (authContext: WorkspaceAuthContext) => {
    let roleId: string;

    if (isDefined(authContext.apiKey)) {
      roleId = await this.apiKeyRoleService.getRoleIdForApiKey(
        authContext.apiKey.id,
        authContext.workspace.id,
      );
    } else {
      const userWorkspaceRoleId =
        await this.userRoleService.getRoleIdForUserWorkspace({
          userWorkspaceId: authContext.userWorkspaceId,
          workspaceId: authContext.workspace.id,
        });

      if (!isDefined(userWorkspaceRoleId)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
          PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        );
      }

      roleId = userWorkspaceRoleId;
    }

    const objectMetadataPermissions =
      await this.workspacePermissionsCacheService.getObjectRecordPermissionsForRoles(
        {
          workspaceId: authContext.workspace.id,
          roleIds: [roleId],
        },
      );

    return { objectsPermissions: objectMetadataPermissions[roleId] };
  };

  async computeSelectedFields({
    authContext,
    depth,
    objectMetadataMapItem,
    objectMetadataMaps,
  }: {
    authContext: WorkspaceAuthContext;
    depth?: Depth | undefined;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
  }): Promise<CommonSelectedFields> {
    const { objectsPermissions } =
      await this.getObjectsPermissions(authContext);

    return this.restToCommonSelectedFieldsHandler.computeFromDepth({
      objectsPermissions,
      objectMetadataMaps,
      objectMetadataMapItem,
      depth,
    });
  }

  async buildCommonOptions(request: AuthenticatedRequest) {
    const { object: parsedObject } = parseCorePath(request);

    const { objectMetadataMaps, objectMetadataMapItem } =
      await this.getObjectMetadata(request, parsedObject);

    const authContext = this.getAuthContextFromRequest(request);

    return {
      authContext,
      objectMetadataItemWithFieldMaps: objectMetadataMapItem,
      objectMetadataMaps: objectMetadataMaps,
    };
  }

  private async getObjectMetadata(
    request: AuthenticatedRequest,
    parsedObject: string,
  ): Promise<{
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
  }> {
    const { workspace } =
      await this.accessTokenService.validateTokenByRequest(request);

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

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
        `No object was found for the workspace associated with this API key. You may generate a new one here ${this.workspaceDomainsService
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
}
