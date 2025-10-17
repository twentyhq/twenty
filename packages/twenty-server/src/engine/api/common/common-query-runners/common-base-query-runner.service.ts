import { Inject, Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonSelectedFieldsHandler } from 'src/engine/api/common/common-args-handlers/common-query-selected-fields/common-selected-fields.handler';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';
import { OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS } from 'src/engine/api/graphql/graphql-query-runner/constants/objects-with-settings-permissions-requirements';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export abstract class CommonBaseQueryRunnerService {
  @Inject()
  protected readonly workspaceQueryHookService: WorkspaceQueryHookService;
  @Inject()
  protected readonly queryRunnerArgsFactory: QueryRunnerArgsFactory;
  @Inject()
  protected readonly queryResultGettersFactory: QueryResultGettersFactory;
  @Inject()
  protected readonly twentyORMGlobalManager: TwentyORMGlobalManager;
  @Inject()
  protected readonly processNestedRelationsHelper: ProcessNestedRelationsHelper;
  @Inject()
  protected readonly permissionsService: PermissionsService;
  @Inject()
  protected readonly userRoleService: UserRoleService;
  @Inject()
  protected readonly apiKeyRoleService: ApiKeyRoleService;
  @Inject()
  protected readonly selectedFieldsHandler: CommonSelectedFieldsHandler;
  @Inject()
  protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService;
  @Inject()
  protected readonly commonResultGettersService: CommonResultGettersService;

  public async prepareQueryRunnerContext({
    authContext,
    objectMetadataItemWithFieldMaps,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }) {
    if (objectMetadataItemWithFieldMaps.isSystem === true) {
      await this.validateSettingsPermissionsOnObjectOrThrow(
        authContext,
        objectMetadataItemWithFieldMaps,
      );
    }

    const workspace = authContext.workspace;

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId: workspace.id,
      });

    const { roleId } = await this.getRoleIdAndObjectsPermissions(
      authContext,
      workspace.id,
    );

    const repository = workspaceDataSource.getRepository(
      objectMetadataItemWithFieldMaps.nameSingular,
      {
        unionOf: [roleId],
      },
      authContext,
    );

    return {
      workspaceDataSource,
      repository,
      isExecutedByApiKey: isDefined(authContext.apiKey),
      roleId,
      shouldBypassPermissionChecks: false,
    };
  }

  public async enrichResultsWithGettersAndHooks({
    results,
    operationName,
    authContext,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
  }: {
    results: ObjectRecord[];
    operationName: CommonQueryNames;
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
  }): Promise<ObjectRecord[]> {
    const resultWithGetters =
      await this.commonResultGettersService.processQueryResult(
        results,
        objectMetadataItemWithFieldMaps.id,
        objectMetadataMaps,
        authContext.workspace.id,
      );

    await this.workspaceQueryHookService.executePostQueryHooks(
      authContext,
      objectMetadataItemWithFieldMaps.nameSingular,
      operationName,
      resultWithGetters,
    );

    return resultWithGetters;
  }

  private async validateSettingsPermissionsOnObjectOrThrow(
    authContext: WorkspaceAuthContext,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    const workspace = authContext.workspace;

    if (
      Object.keys(OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS).includes(
        objectMetadataItemWithFieldMaps.nameSingular,
      )
    ) {
      const permissionRequired: PermissionFlagType =
        OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS[
          objectMetadataItemWithFieldMaps.nameSingular as keyof typeof OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS
        ];

      const userHasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId: authContext.userWorkspaceId,
          setting: permissionRequired,
          workspaceId: workspace.id,
          apiKeyId: authContext.apiKey?.id,
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
    }
  }

  private async getRoleIdAndObjectsPermissions(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    let roleId: string;

    if (
      !isDefined(authContext.apiKey) &&
      !isDefined(authContext.userWorkspaceId)
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
        PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      );
    }

    if (isDefined(authContext.apiKey)) {
      roleId = await this.apiKeyRoleService.getRoleIdForApiKey(
        authContext.apiKey.id,
        workspaceId,
      );
    } else {
      const userWorkspaceRoleId =
        await this.userRoleService.getRoleIdForUserWorkspace({
          userWorkspaceId: authContext.userWorkspaceId,
          workspaceId,
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
          workspaceId: workspaceId,
          roleIds: [roleId],
        },
      );

    return { roleId, objectsPermissions: objectMetadataPermissions[roleId] };
  }
}
