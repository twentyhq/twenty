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
import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
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
  protected readonly workspaceCacheService: WorkspaceCacheService;
  @Inject()
  protected readonly actorFromAuthContextService: ActorFromAuthContextService;
  @Inject()
  protected readonly workspaceCacheStorageService: WorkspaceCacheStorageService;
  @Inject()
  protected readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
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
      roleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
        authContext.apiKey.id,
        authContext.workspace.id,
      );
    } else {
      if (!isDefined(authContext.userWorkspaceId)) {
        throw new PermissionsException(
          'No user workspace ID found in authentication context',
          PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
        );
      }

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

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['rolesPermissions'],
      );

    return { objectsPermissions: rolesPermissions[roleId] };
  };

  async computeSelectedFields({
    authContext,
    depth,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    authContext: WorkspaceAuthContext;
    depth?: Depth | undefined;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<CommonSelectedFields> {
    const { objectsPermissions } =
      await this.getObjectsPermissions(authContext);

    return this.restToCommonSelectedFieldsHandler.computeFromDepth({
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      depth,
    });
  }

  async buildCommonOptions(request: AuthenticatedRequest) {
    const { object: parsedObject } = parseCorePath(request);

    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.getObjectMetadata(request, parsedObject);

    const authContext = this.getAuthContextFromRequest(request);

    return {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    };
  }

  private async getObjectMetadata(
    request: AuthenticatedRequest,
    parsedObject: string,
  ): Promise<{
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
    objectIdByNameSingular: Record<string, string>;
  }> {
    const { workspace } =
      await this.accessTokenService.validateTokenByRequest(request);

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspace.id);

    if (currentCacheVersion === undefined) {
      if (isDefined(workspace.metadataVersion)) {
        await this.workspaceCacheStorageService.setMetadataVersion(
          workspace.id,
          workspace.metadataVersion,
        );
      } else {
        throw new BadRequestException(
          'Workspace metadata version not found in database',
        );
      }
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: workspace.id,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatIndexMaps',
          ],
        },
      );

    if (!isDefined(flatObjectMetadataMaps)) {
      throw new BadRequestException(
        `No object was found for the workspace associated with this API key. You may generate a new one here ${this.workspaceDomainsService
          .buildWorkspaceURL({
            workspace,
            pathname: getSettingsPath(SettingsPath.ApiWebhooks),
          })
          .toString()}`,
      );
    }

    const { idByNameSingular, idByNamePlural } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    let objectId = idByNamePlural[parsedObject];
    let flatObjectMetadataItem = objectId
      ? flatObjectMetadataMaps.byId[objectId]
      : undefined;

    if (!flatObjectMetadataItem) {
      const wrongObjectId = idByNameSingular[parsedObject];
      const wrongFlatObjectMetadataItem = wrongObjectId
        ? flatObjectMetadataMaps.byId[wrongObjectId]
        : undefined;

      let hint = 'eg: companies';

      if (wrongFlatObjectMetadataItem) {
        hint = `Did you mean '${wrongFlatObjectMetadataItem.namePlural}'?`;
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
        flatObjectMetadataItem,
        standardObjectMetadataDefinitions,
        workspaceFeatureFlagsMap,
      )
    ) {
      throw new BadRequestException(
        `object '${parsedObject}' not found. ${parsedObject} is not available via REST API.`,
      );
    }

    return {
      flatObjectMetadata: flatObjectMetadataItem,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      objectIdByNameSingular: idByNameSingular,
    };
  }
}
