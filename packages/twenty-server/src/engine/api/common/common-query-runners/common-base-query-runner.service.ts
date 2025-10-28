import { Inject, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { Omit } from 'zod/v4/core/util.cjs';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

import { CommonSelectedFieldsHandler } from 'src/engine/api/common/common-args-handlers/common-query-selected-fields/common-selected-fields.handler';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryArgs,
  CommonQueryNames,
} from 'src/engine/api/common/types/common-query-args.type';
import { CommonQueryResult } from 'src/engine/api/common/types/common-query-result.type';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS } from 'src/engine/api/graphql/graphql-query-runner/constants/objects-with-settings-permissions-requirements';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { WorkspacePreQueryHookPayload } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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
export abstract class CommonBaseQueryRunnerService<
  Args extends CommonQueryArgs,
  Output extends CommonQueryResult,
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
  @Inject()
  protected readonly selectedFieldsHandler: CommonSelectedFieldsHandler;
  @Inject()
  protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService;
  @Inject()
  protected readonly commonResultGettersService: CommonResultGettersService;
  @Inject()
  protected readonly throttlerService: ThrottlerService;
  @Inject()
  protected readonly twentyConfigService: TwentyConfigService;
  @Inject()
  protected readonly metricsService: MetricsService;

  protected abstract readonly operationName: CommonQueryNames;

  public async execute(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<Output> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      queryRunnerContext;

    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }

    await this.throttleQueryExecution(authContext);

    await this.validate(args, queryRunnerContext);

    if (objectMetadataItemWithFieldMaps.isSystem === true) {
      await this.validateSettingsPermissionsOnObjectOrThrow(
        authContext,
        queryRunnerContext,
      );
    }

    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const processedArgs = await this.processArgs(
      args,
      queryRunnerContext,
      this.operationName,
      commonQueryParser,
    );

    const extendedQueryRunnerContext =
      await this.prepareExtendedQueryRunnerContext(
        authContext,
        queryRunnerContext,
      );

    const results = await this.run(processedArgs, {
      ...extendedQueryRunnerContext,
      commonQueryParser,
    });

    return this.enrichResultsWithGettersAndHooks({
      results,
      operationName: this.operationName,
      authContext,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });
  }

  protected abstract run(
    args: CommonExtendedInput<Args>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<Output>;

  protected abstract validate(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void>;

  protected abstract computeArgs(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<Args>>;

  protected abstract processQueryResult(
    queryResult: Output,
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    authContext: WorkspaceAuthContext,
  ): Promise<Output>;

  private async processArgs(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
    operationName: CommonQueryNames,
    commonQueryParser: GraphqlQueryParser,
  ): Promise<CommonExtendedInput<Args>> {
    const selectedFieldsResult = commonQueryParser.parseSelectedFields(
      args.selectedFields,
    );

    const { authContext, objectMetadataItemWithFieldMaps } = queryRunnerContext;
    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        operationName,
        args as WorkspacePreQueryHookPayload<CommonQueryNames>,
      )) as CommonInput<Args>;

    const computedArgs = await this.computeArgs(hookedArgs, queryRunnerContext);

    return {
      ...computedArgs,
      selectedFieldsResult,
    };
  }

  private async enrichResultsWithGettersAndHooks({
    results,
    operationName,
    authContext,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
  }: {
    results: Output;
    operationName: CommonQueryNames;
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
  }): Promise<Output> {
    const resultWithGetters = await this.processQueryResult(
      results,
      objectMetadataItemWithFieldMaps.id,
      objectMetadataMaps,
      authContext,
    );

    await this.workspaceQueryHookService.executePostQueryHooks(
      authContext,
      objectMetadataItemWithFieldMaps.nameSingular,
      operationName,
      resultWithGetters as QueryResultFieldValue,
    );

    return resultWithGetters as Output;
  }

  private async validateSettingsPermissionsOnObjectOrThrow(
    authContext: WorkspaceAuthContext,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ) {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

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

  private async prepareExtendedQueryRunnerContext(
    authContext: WorkspaceAuthContext,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<Omit<CommonExtendedQueryRunnerContext, 'commonQueryParser'>> {
    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId: authContext.workspace.id,
      });

    const { roleId } = await this.getRoleIdAndObjectsPermissions(
      authContext,
      authContext.workspace.id,
    );

    const rolePermissionConfig = { unionOf: [roleId] };

    const repository = workspaceDataSource.getRepository(
      queryRunnerContext.objectMetadataItemWithFieldMaps.nameSingular,
      rolePermissionConfig,
      authContext,
    );

    return {
      ...queryRunnerContext,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
      repository,
    };
  }

  private async throttleQueryExecution(authContext: WorkspaceAuthContext) {
    try {
      if (!isDefined(authContext.apiKey)) return;

      const workspaceId = authContext.workspace.id;

      const shortConfig = {
        key: `api:throttler:${workspaceId}-short-limit`,
        maxTokens: this.twentyConfigService.get(
          'API_RATE_LIMITING_SHORT_LIMIT',
        ),
        timeWindow: this.twentyConfigService.get(
          'API_RATE_LIMITING_SHORT_TTL_IN_MS',
        ),
      };

      const longConfig = {
        key: `api:throttler:${workspaceId}-long-limit`,
        maxTokens: this.twentyConfigService.get('API_RATE_LIMITING_LONG_LIMIT'),
        timeWindow: this.twentyConfigService.get(
          'API_RATE_LIMITING_LONG_TTL_IN_MS',
        ),
      };

      await this.throttlerService.tokenBucketThrottleOrThrow(
        shortConfig.key,
        1,
        shortConfig.maxTokens,
        shortConfig.timeWindow,
      );

      await this.throttlerService.tokenBucketThrottleOrThrow(
        longConfig.key,
        1,
        longConfig.maxTokens,
        longConfig.timeWindow,
      );
    } catch (error) {
      await this.metricsService.incrementCounter({
        key: MetricsKeys.CommonApiQueryRateLimited,
        shouldStoreInCache: false,
      });

      throw error;
    }
  }
}
