import { Inject, Injectable } from '@nestjs/common';

import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

import { DataArgProcessor } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg.processor';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-processors/query-runner-args.factory';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
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
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { OBJECTS_WITH_SETTINGS_PERMISSIONS_REQUIREMENTS } from 'src/engine/api/graphql/graphql-query-runner/constants/objects-with-settings-permissions-requirements';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { WorkspacePreQueryHookPayload } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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

  protected readonly isReadOnly: boolean = false;

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
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
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

    const selectedFieldsResult = commonQueryParser.parseSelectedFields(
      args.selectedFields,
    );

    this.validateQueryComplexity(selectedFieldsResult, args);

    const processedArgs = {
      ...(await this.processArgs(args, queryRunnerContext, this.operationName)),
      selectedFieldsResult,
    } as CommonExtendedInput<Args>;

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () =>
        this.executeQueryAndEnrichResults(
          processedArgs,
          authContext,
          queryRunnerContext,
          commonQueryParser,
        ),
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

  protected computeQueryComplexity(
    selectedFieldsResult: CommonSelectedFieldsResult,
    _args: CommonInput<Args>,
  ): number {
    const simpleFieldsComplexity = 1;
    const selectedFieldsComplexity =
      simpleFieldsComplexity + (selectedFieldsResult.relationFieldsCount ?? 0);

    return selectedFieldsComplexity;
  }

  private async processArgs(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
    operationName: CommonQueryNames,
  ): Promise<CommonInput<Args>> {
    const { authContext, flatObjectMetadata } = queryRunnerContext;

    const computedArgs = await this.computeArgs(args, queryRunnerContext);

    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        flatObjectMetadata.nameSingular,
        operationName,
        computedArgs as WorkspacePreQueryHookPayload<CommonQueryNames>,
      )) as CommonInput<Args>;

    return hookedArgs;
  }

  private async executeQueryAndEnrichResults(
    processedArgs: CommonExtendedInput<Args>,
    authContext: WorkspaceAuthContext,
    queryRunnerContext: CommonBaseQueryRunnerContext,
    commonQueryParser: GraphqlQueryParser,
  ): Promise<Output> {
    const extendedQueryRunnerContext =
      await this.prepareExtendedQueryRunnerContextWithGlobalDatasource(
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

  private async getRoleIdOrThrow(
    authContext: AuthContext,
    workspaceId: string,
  ): Promise<string> {
    if (isDefined(authContext.apiKey)) {
      return this.apiKeyRoleService.getRoleIdForApiKeyId(
        authContext.apiKey.id,
        workspaceId,
      );
    }

    if (isDefined(authContext.application?.defaultServerlessFunctionRoleId)) {
      return authContext.application?.defaultServerlessFunctionRoleId;
    }

    if (!isDefined(authContext.userWorkspaceId)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId: authContext.userWorkspaceId,
      workspaceId,
    });
  }

  private async prepareExtendedQueryRunnerContextWithGlobalDatasource(
    authContext: WorkspaceAuthContext,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<Omit<CommonExtendedQueryRunnerContext, 'commonQueryParser'>> {
    const workspaceId = authContext.workspace.id;

    const roleId = await this.getRoleIdOrThrow(authContext, workspaceId);

    const rolePermissionConfig: RolePermissionConfig = {
      intersectionOf: [roleId],
    };

    const globalWorkspaceDataSource = this.isReadOnly
      ? await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSourceReplica()
      : await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    const repository = globalWorkspaceDataSource.getRepository(
      queryRunnerContext.flatObjectMetadata.nameSingular,
      rolePermissionConfig,
    );

    return {
      ...queryRunnerContext,
      authContext,
      workspaceDataSource: globalWorkspaceDataSource,
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

  private validateQueryComplexity(
    selectedFieldsResult: CommonSelectedFieldsResult,
    args: CommonInput<Args>,
  ) {
    const maximumComplexity = this.twentyConfigService.get(
      'COMMON_QUERY_COMPLEXITY_LIMIT',
    );

    if (selectedFieldsResult.hasAtLeastTwoNestedOneToManyRelations) {
      throw new CommonQueryRunnerException(
        `Query complexity is too high. One-to-Many relation cannot be nested in another One-to-Many relation.`,
        CommonQueryRunnerExceptionCode.TOO_COMPLEX_QUERY,
        {
          userFriendlyMessage: STANDARD_ERROR_MESSAGE,
        },
      );
    }

    const queryComplexity = this.computeQueryComplexity(
      selectedFieldsResult,
      args,
    );

    if (queryComplexity > maximumComplexity) {
      throw new CommonQueryRunnerException(
        `Query complexity is too high. Please, reduce the amount of relation fields requested. Query complexity: ${queryComplexity}. Maximum complexity: ${maximumComplexity}.`,
        CommonQueryRunnerExceptionCode.TOO_COMPLEX_QUERY,
        {
          userFriendlyMessage: STANDARD_ERROR_MESSAGE,
        },
      );
    }
  }
}
