import { Inject, Injectable } from '@nestjs/common';

import {
  assertIsDefinedOrThrow,
  capitalize,
  isDefined,
} from 'twenty-shared/utils';

import { CommonQueryRunnerOptions } from 'src/engine/api/common/interfaces/common-query-runner-options.interface';
import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { type IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { ResolverArgsType } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import {
  CommonQueryArgs,
  CommonQueryNames,
} from 'src/engine/api/common/types/common-query-args.type';
import { OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS } from 'src/engine/api/graphql/graphql-query-runner/constants/objects-with-settings-permissions-requirements';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export abstract class CommonBaseQueryRunnerService<
  Input extends CommonQueryArgs,
  Response extends
    | ObjectRecord
    | ObjectRecord[]
    | IConnection<ObjectRecord, IEdge<ObjectRecord>>
    | IConnection<ObjectRecord, IEdge<ObjectRecord>>[],
> {
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

  public async execute(
    args: Input,
    options: CommonQueryRunnerOptions,
    operationName: CommonQueryNames,
  ): Promise<Response | undefined> {
    try {
      const { authContext, objectMetadataItemWithFieldMaps } = options;
      const workspace = authContext.workspace;

      assertIsDefinedOrThrow(workspace);

      await this.validate(args, options);

      const workspaceDataSource =
        await this.twentyORMGlobalManager.getDataSourceForWorkspace({
          workspaceId: workspace.id,
        });

      if (objectMetadataItemWithFieldMaps.isSystem === true) {
        await this.validateSettingsPermissionsOnObjectOrThrow(options);
      }

      const hookedArgs =
        await this.workspaceQueryHookService.executePreQueryHooks(
          authContext,
          objectMetadataItemWithFieldMaps.nameSingular,
          operationName,
          args,
        );

      const computedArgs = (await this.queryRunnerArgsFactory.create(
        hookedArgs,
        options,
        ResolverArgsType[
          //TODO : Refacto-common
          capitalize(operationName) as keyof typeof ResolverArgsType
        ],
        //TODO : Refacto-common
      )) as Input;

      const roleId = await this.getRoleId(authContext, workspace.id);

      const repository = workspaceDataSource.getRepository(
        objectMetadataItemWithFieldMaps.nameSingular,
        false,
        roleId,
        authContext,
      );

      const commonBaseMethodExecutionArgs = {
        args: computedArgs,
        options,
        workspaceDataSource,
        repository,
        selectedFieldsResult: args.selectedFieldsResult,
        isExecutedByApiKey: isDefined(authContext.apiKey),
        roleId,
        shouldBypassPermissionChecks: false,
      };

      const results = await this.run(
        commonBaseMethodExecutionArgs,
        workspaceDataSource.featureFlagMap,
      );

      const resultWithGetters = await this.queryResultGettersFactory.create(
        results,
        objectMetadataItemWithFieldMaps,
        workspace.id,
        options.objectMetadataMaps,
      );

      await this.workspaceQueryHookService.executePostQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        operationName,
        resultWithGetters,
      );

      return resultWithGetters;
    } catch (error) {
      workspaceQueryRunnerGraphqlApiExceptionHandler(error);
    }
  }

  private async validateSettingsPermissionsOnObjectOrThrow(
    options: CommonQueryRunnerOptions,
  ) {
    const { authContext, objectMetadataItemWithFieldMaps } = options;

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace);

    if (
      Object.keys(OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS).includes(
        objectMetadataItemWithFieldMaps.nameSingular,
      )
    ) {
      const permissionRequired: PermissionFlagType =
        // @ts-expect-error legacy noImplicitAny
        OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS[
          objectMetadataItemWithFieldMaps.nameSingular
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

  private async getRoleId(authContext: AuthContext, workspaceId: string) {
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

    return roleId;
  }

  protected abstract run(
    executionArgs: CommonBaseQueryRunnerContext<Input>,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<Response>;

  protected abstract validate(
    args: Input,
    options: CommonQueryRunnerOptions,
  ): Promise<void>;
}
