import { Inject, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { Omit } from 'zod/v4/core/util.cjs';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

import { DataArgProcessor } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg.processor';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-processors/query-runner-args.factory';
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
import { WorkspacePreQueryHookPayload } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
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
  protected readonly dataArgProcessor: DataArgProcessor;
  @Inject()
  protected readonly twentyORMGlobalManager: TwentyORMGlobalManager;
  @Inject()
  protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  @Inject()
  protected readonly processNestedRelationsHelper: ProcessNestedRelationsHelper;
  @Inject()
  protected readonly permissionsService: PermissionsService;
  @Inject()
  protected readonly userRoleService: UserRoleService;
  @Inject()
  protected readonly apiKeyRoleService: ApiKeyRoleService;
  @Inject()
  protected readonly workspaceCacheService: WorkspaceCacheService;
  @Inject()
  protected readonly commonResultGettersService: CommonResultGettersService;
  @Inject()
  protected readonly throttlerService: ThrottlerService;
  @Inject()
  protected readonly twentyConfigService: TwentyConfigService;
  @Inject()
  protected readonly metricsService: MetricsService;
  @Inject()
  protected readonly featureFlagService: FeatureFlagService;

  protected abstract readonly operationName: CommonQueryNames;

  public async execute(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<Output> {
    const {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }

    await this.throttleQueryExecution(authContext);

    await this.validate(args, queryRunnerContext);

    if (flatObjectMetadata.isSystem === true) {
      await this.validateSettingsPermissionsOnObjectOrThrow(
        authContext,
        queryRunnerContext,
      );
    }

    const commonQueryParser = new GraphqlQueryParser(
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    const processedArgs = await this.processArgs(
      args,
      queryRunnerContext,
      this.operationName,
      commonQueryParser,
    );

    const isGlobalDatasourceEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_GLOBAL_WORKSPACE_DATASOURCE_ENABLED,
        authContext.workspace.id,
      );

    if (isGlobalDatasourceEnabled) {
      return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () =>
          this.executeQueryAndEnrichResults(
            processedArgs,
            authContext,
            queryRunnerContext,
            commonQueryParser,
            isGlobalDatasourceEnabled,
          ),
      );
    }

    return this.executeQueryAndEnrichResults(
      processedArgs,
      authContext,
      queryRunnerContext,
      commonQueryParser,
      isGlobalDatasourceEnabled,
    );
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
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
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

    const { authContext, flatObjectMetadata } = queryRunnerContext;

    const computedArgs = await this.computeArgs(args, queryRunnerContext);

    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        flatObjectMetadata.nameSingular,
        operationName,
        computedArgs as WorkspacePreQueryHookPayload<CommonQueryNames>,
      )) as CommonInput<Args>;

    return {
      ...hookedArgs,
      selectedFieldsResult,
    };
  }

  private async executeQueryAndEnrichResults(
    processedArgs: CommonExtendedInput<Args>,
    authContext: WorkspaceAuthContext,
    queryRunnerContext: CommonBaseQueryRunnerContext,
    commonQueryParser: GraphqlQueryParser,
    isGlobalDatasourceEnabled: boolean,
  ): Promise<Output> {
    const extendedQueryRunnerContext = isGlobalDatasourceEnabled
      ? await this.prepareExtendedQueryRunnerContextWithGlobalDatasource(
          authContext,
          queryRunnerContext,
        )
      : await this.prepareExtendedQueryRunnerContext(
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
      flatObjectMetadata: queryRunnerContext.flatObjectMetadata,
      flatObjectMetadataMaps: queryRunnerContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: queryRunnerContext.flatFieldMetadataMaps,
    });
  }

  private async enrichResultsWithGettersAndHooks({
    results,
    operationName,
    authContext,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    results: Output;
    operationName: CommonQueryNames;
    authContext: WorkspaceAuthContext;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<Output> {
    const resultWithGetters = await this.processQueryResult(
      results,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext,
    );

    await this.workspaceQueryHookService.executePostQueryHooks(
      authContext,
      flatObjectMetadata.nameSingular,
      operationName,
      resultWithGetters as QueryResultFieldValue,
    );

    return resultWithGetters as Output;
  }

  private async validateSettingsPermissionsOnObjectOrThrow(
    authContext: WorkspaceAuthContext,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ) {
    const { flatObjectMetadata } = queryRunnerContext;

    const workspace = authContext.workspace;

    if (
      Object.keys(OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS).includes(
        flatObjectMetadata.nameSingular,
      )
    ) {
      const permissionRequired: PermissionFlagType =
        OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS[
          flatObjectMetadata.nameSingular as keyof typeof OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS
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

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    return { roleId, objectsPermissions: rolesPermissions[roleId] };
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
      queryRunnerContext.flatObjectMetadata.nameSingular,
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

  private async prepareExtendedQueryRunnerContextWithGlobalDatasource(
    authContext: WorkspaceAuthContext,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<Omit<CommonExtendedQueryRunnerContext, 'commonQueryParser'>> {
    const workspaceId = authContext.workspace.id;

    const { roleId } = await this.getRoleIdAndObjectsPermissions(
      authContext,
      workspaceId,
    );

    const rolePermissionConfig = { unionOf: [roleId] };

    const repository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      queryRunnerContext.flatObjectMetadata.nameSingular,
      rolePermissionConfig,
    );

    const globalWorkspaceDataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    return {
      ...queryRunnerContext,
      authContext,
      workspaceDataSource:
        globalWorkspaceDataSource as unknown as WorkspaceDataSource,
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
