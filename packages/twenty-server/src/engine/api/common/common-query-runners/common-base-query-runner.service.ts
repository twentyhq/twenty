import { Inject, Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

import { DataArgProcessorService } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg-processor.service';
import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { GroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/group-by-arg-processor.service';
import { OrderByArgProcessorService } from 'src/engine/api/common/common-args-processors/order-by-arg-processor/order-by-arg-processor.service';
import { OrderByWithGroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/order-by-with-group-by-arg-processor/order-by-with-group-by-arg-processor.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-processors/query-runner-args.factory';
import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { buildApplicationApiRateLimitedLogEntry } from 'src/engine/api/common/common-query-runners/utils/build-application-api-rate-limited-log-entry.util';
import { buildApplicationApiRateLimitedLogLine } from 'src/engine/api/common/common-query-runners/utils/build-application-api-rate-limited-log-line.util';
import { buildMutationQueryBuilder } from 'src/engine/api/common/common-query-runners/utils/build-mutation-query-builder.util';
import { computeMaxFieldCountPerRecord } from 'src/engine/api/common/common-query-runners/utils/compute-max-field-count-per-record.util';
import { isRecordFilterEmpty } from 'src/engine/api/common/common-query-runners/utils/is-record-filter-empty.util';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryArgs,
  CommonQueryNames,
} from 'src/engine/api/common/types/common-query-args.type';
import {
  CommonQueryExecutionResult,
  CommonQueryResult,
  CommonQueryRunResult,
} from 'src/engine/api/common/types/common-query-result.type';
import { type CommonQueryResultProcessingArgs } from 'src/engine/api/common/types/common-query-result-processing-args.type';
import { type CommonRelationsAggregatedValues } from 'src/engine/api/common/types/common-aggregated-values.type';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type NestedRelationsReadPathOptions } from 'src/engine/api/common/types/nested-relations-read-path-options.type';
import { CommonQueryParser } from 'src/engine/api/common/common-query-parsers/common-query.parser';
import { buildColumnsToReturn } from 'src/engine/api/common/utils/build-columns-to-return';
import { WorkspacePreQueryHookPayload } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ApplicationRepeatedEventRecorderService } from 'src/engine/core-modules/event-logs/emit/application-repeated-event-recorder.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { getApiType } from 'src/engine/core-modules/usage/storage/api-request-context.storage';
import { buildUsageSpendersFromAuthContext } from 'src/engine/core-modules/usage/utils/build-usage-spenders-from-auth-context.util';
import { DynamicFieldService } from 'src/engine/api/common/common-dynamic-fields/services/dynamic-field.service';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RelationNestedQueries } from 'src/engine/twenty-orm/field-operations/relation-nested-queries/relation-nested-queries';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type MutationKind } from 'src/engine/twenty-orm/sql/utils/build-mutation-statement.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { addTimelineActivityObjectColumnsToSelect } from 'src/modules/timeline/utils/add-timeline-activity-object-columns-to-select.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';

@Injectable()
export abstract class CommonBaseQueryRunnerService<
  Args extends CommonQueryArgs,
  Output extends CommonQueryResult,
> {
  private readonly logger = new Logger(CommonBaseQueryRunnerService.name);

  @Inject()
  protected readonly workspaceQueryHookService: WorkspaceQueryHookService;
  @Inject()
  protected readonly queryRunnerArgsFactory: QueryRunnerArgsFactory;
  @Inject()
  protected readonly dataArgProcessor: DataArgProcessorService;
  @Inject()
  protected readonly filterArgProcessor: FilterArgProcessorService;
  @Inject()
  protected readonly groupByArgProcessor: GroupByArgProcessorService;
  @Inject()
  protected readonly orderByArgProcessor: OrderByArgProcessorService;
  @Inject()
  protected readonly orderByWithGroupByArgProcessor: OrderByWithGroupByArgProcessorService;
  @Inject()
  protected readonly workspaceOrmManager: WorkspaceOrmManager;
  @Inject()
  protected readonly processNestedRelationsHelper: ProcessNestedRelationsHelper;
  @Inject()
  protected readonly workspaceCacheService: WorkspaceCacheService;
  @Inject()
  protected readonly commonResultGettersService: CommonResultGettersService;
  @Inject()
  protected readonly commonRecordVisibilityService: CommonRecordVisibilityService;
  @Inject()
  protected readonly usageLimitSpeedService: UsageLimitSpeedService;
  @Inject()
  protected readonly usageRecorderService: UsageRecorderService;
  @Inject()
  protected readonly twentyConfigService: TwentyConfigService;
  @Inject()
  protected readonly metricsService: MetricsService;
  @Inject()
  protected readonly applicationRepeatedEventRecorderService: ApplicationRepeatedEventRecorderService;
  @Inject()
  protected readonly recordFieldPermissionsReadService: RecordFieldPermissionsReadService;
  @Inject()
  protected readonly dynamicFieldService: DynamicFieldService;

  protected abstract readonly operationName: CommonQueryNames;

  protected readonly isReadOnly: boolean = false;

  public async execute(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonQueryExecutionResult<Output, Args>> {
    const {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    const isRootOperation =
      (queryRunnerContext.nestedOperationDepth ?? 0) === 0;

    if (isRootOperation) {
      await this.consumeApiSpeedLimit(authContext);
    }

    await this.validate(args, queryRunnerContext);

    const commonQueryParser = new CommonQueryParser({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const selectedFieldsResult = commonQueryParser.parseSelectedFields(
      args.selectedFields,
    );

    await this.dynamicFieldService.prepareSelection({
      authContext,
      selection: selectedFieldsResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const processedArgs = {
      ...(await this.processArgs(args, queryRunnerContext, this.operationName)),
      selectedFieldsResult,
    } as CommonExtendedInput<Args>;

    this.validateQueryComplexity(
      selectedFieldsResult,
      processedArgs,
      queryRunnerContext,
    );

    if (isRootOperation) {
      this.recordApiComplexityUsage(authContext, () =>
        this.computeQueryComplexityV2(
          selectedFieldsResult,
          processedArgs,
          queryRunnerContext,
        ),
      );
    }

    const { result, relationAggregatedValues } =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.executeQueryAndEnrichResults(
            processedArgs,
            queryRunnerContext,
            commonQueryParser,
          ),
        authContext,
      );

    return {
      results: result,
      relationAggregatedValues,
      args: processedArgs,
    };
  }

  protected abstract run(
    args: CommonExtendedInput<Args>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<Output>>;

  protected abstract validate(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void>;

  protected abstract computeArgs(
    args: CommonInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<Args>>;

  protected abstract processQueryResult(
    args: CommonQueryResultProcessingArgs<Output>,
  ): Promise<Output>;

  protected abstract getResultRecords(results: Output): ObjectRecord[];

  protected computeQueryComplexity(
    selectedFieldsResult: CommonSelectedFieldsResult,
    _args: CommonExtendedInput<Args>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): number {
    const simpleFieldsComplexity = 1;
    const selectedFieldsComplexity =
      simpleFieldsComplexity + selectedFieldsResult.relationFieldsCount;

    return selectedFieldsComplexity;
  }

  protected computeQueryComplexityV2(
    selectedFieldsResult: CommonSelectedFieldsResult,
    _args: CommonExtendedInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): number {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    return computeMaxFieldCountPerRecord({
      selection: selectedFieldsResult,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      recordLimitPerOneToManyRelation: QUERY_MAX_RECORDS_FROM_RELATION,
    });
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

    if (!('filter' in hookedArgs) || !isPlainObject(hookedArgs.filter)) {
      return hookedArgs;
    }

    return {
      ...hookedArgs,
      filter: await this.dynamicFieldService.rewriteDynamicFieldFilters({
        authContext,
        filter: hookedArgs.filter,
        flatObjectMetadata,
        flatObjectMetadataMaps: queryRunnerContext.flatObjectMetadataMaps,
        flatFieldMetadataMaps: queryRunnerContext.flatFieldMetadataMaps,
      }),
    };
  }

  private async executeQueryAndEnrichResults(
    processedArgs: CommonExtendedInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
    commonQueryParser: CommonQueryParser,
  ): Promise<CommonQueryRunResult<Output>> {
    const extendedQueryRunnerContext =
      await this.prepareExtendedQueryRunnerContextWithGlobalDatasource(
        queryRunnerContext,
      );

    const { result, relationAggregatedValues } = await this.run(
      {
        ...processedArgs,
        selectedFieldsResult: addTimelineActivityObjectColumnsToSelect({
          selection: processedArgs.selectedFieldsResult,
          flatObjectMetadata: queryRunnerContext.flatObjectMetadata,
          recordReadRestrictions:
            extendedQueryRunnerContext.recordReadRestrictions,
          flatObjectMetadataMaps: queryRunnerContext.flatObjectMetadataMaps,
          flatFieldMetadataMaps: queryRunnerContext.flatFieldMetadataMaps,
        }),
      },
      {
        ...extendedQueryRunnerContext,
        commonQueryParser,
      },
    );

    const enrichedResult = await this.enrichResultsWithGettersAndHooks({
      results: result,
      selection: processedArgs.selectedFieldsResult,
      operationName: this.operationName,
      authContext: extendedQueryRunnerContext.authContext,
      flatObjectMetadata: queryRunnerContext.flatObjectMetadata,
      flatObjectMetadataMaps: queryRunnerContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: queryRunnerContext.flatFieldMetadataMaps,
      transactionScope: queryRunnerContext.transactionScope,
      recordReadRestrictions: extendedQueryRunnerContext.recordReadRestrictions,
    });

    return { result: enrichedResult, relationAggregatedValues };
  }

  private async enrichResultsWithGettersAndHooks({
    results,
    selection,
    operationName,
    authContext,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    transactionScope,
    recordReadRestrictions,
  }: {
    results: Output;
    selection: CommonSelection;
    operationName: CommonQueryNames;
    authContext: WorkspaceAuthContext;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    transactionScope: CommonBaseQueryRunnerContext['transactionScope'];
    recordReadRestrictions: RecordReadRestrictions;
  }): Promise<Output> {
    const resultWithGetters = await this.processQueryResult({
      queryResult: results,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      workspaceId: authContext.workspace.id,
      selection,
    });

    await this.commonRecordVisibilityService.applyVisibilityRestrictions({
      records: this.getResultRecords(resultWithGetters),
      flatObjectMetadata,
      selection,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      authContext,
      recordReadRestrictions,
    });

    const executePostQueryHooks = () =>
      this.workspaceQueryHookService.executePostQueryHooks(
        authContext,
        flatObjectMetadata.nameSingular,
        operationName,
        resultWithGetters as QueryResultFieldValue,
      );

    if (isDefined(transactionScope)) {
      transactionScope.afterCommit(executePostQueryHooks);
    } else {
      await executePostQueryHooks();
    }

    return resultWithGetters as Output;
  }

  private async prepareExtendedQueryRunnerContextWithGlobalDatasource(
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<Omit<CommonExtendedQueryRunnerContext, 'commonQueryParser'>> {
    const context = getWorkspaceContext();

    const repository = isDefined(queryRunnerContext.transactionScope)
      ? queryRunnerContext.transactionScope.getRepository<ObjectRecord>(
          queryRunnerContext.flatObjectMetadata.nameSingular,
        )
      : this.workspaceOrmManager.getRepository<ObjectRecord>(
          queryRunnerContext.flatObjectMetadata.nameSingular,
          { useReplica: this.isReadOnly },
        );

    return {
      ...queryRunnerContext,
      authContext: context.authContext,
      repository,
      featureFlagsMap: context.featureFlagsMap,
      flatFieldMetadataOptionMaps: context.flatFieldMetadataOptionMaps,
      permissionsPrincipals: context.permissionsPrincipals,
      recordReadRestrictions: context.recordReadRestrictions,
    };
  }

  // The repository already uses the replica only on read-only runners, so root reads and nested-relation loading agree
  protected getReadRepository({
    repository,
  }: Pick<
    CommonExtendedQueryRunnerContext,
    'repository'
  >): WorkspaceRepository {
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.OrmV2ReadPathUsed,
      amount: 1,
      attributes: { operation: this.operationName },
    });

    return repository;
  }

  protected getWriteRepository({
    repository,
  }: Pick<
    CommonExtendedQueryRunnerContext,
    'repository'
  >): WorkspaceRepository {
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.OrmV2WritePathUsed,
      amount: 1,
      attributes: { operation: this.operationName },
    });

    return repository;
  }

  protected async runFilteredMutation({
    queryRunnerContext,
    filter,
    selection,
    kind,
    data,
    shouldWriteAtLeastOneRecord,
  }: {
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    filter: Partial<ObjectRecordFilter>;
    selection: CommonSelection;
    kind: MutationKind;
    data?: Partial<ObjectRecord>;
    shouldWriteAtLeastOneRecord?: boolean;
  }): Promise<CommonQueryRunResult<ObjectRecord[]>> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      commonQueryParser,
    } = queryRunnerContext;
    const alias = flatObjectMetadata.nameSingular;

    const columnsToReturn = buildColumnsToReturn({
      selection,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (isRecordFilterEmpty(filter)) {
      throw new CommonQueryRunnerException(
        'A non-empty filter is required for a bulk mutation',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const writeRepository = this.getWriteRepository(queryRunnerContext);

    const resolvedData =
      kind === 'update' && isDefined(data)
        ? (
            await this.resolveNestedRelations({
              records: [data],
              queryRunnerContext,
              writeRepository,
            })
          )[0]
        : data;

    const { selectQueryBuilder, rowLevelPermissionsApplied } =
      await buildMutationQueryBuilder({
        repository: writeRepository,
        alias,
        filter,
        commonQueryParser,
        kind,
      });

    const records = await writeRepository.runMutation({
      selectQueryBuilder,
      rowLevelPermissionsApplied,
      kind,
      columnsToReturn,
      data: resolvedData,
      shouldWriteAtLeastOneRecord,
    });

    const relationAggregatedValues = await this.processNestedRelations({
      records,
      selection,
      queryRunnerContext,
    });

    return { result: records, relationAggregatedValues };
  }

  protected async resolveNestedRelations({
    records,
    queryRunnerContext,
    writeRepository,
    createRecords,
  }: {
    records: Partial<ObjectRecord>[];
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    writeRepository: WorkspaceRepository;
    createRecords?: (options: {
      targetObjectMetadata: FlatObjectMetadata;
      records: Partial<ObjectRecord>[];
    }) => Promise<ObjectRecord[]>;
  }): Promise<Partial<ObjectRecord>[]> {
    const { flatObjectMetadata, flatFieldMetadataMaps } = queryRunnerContext;
    const nameSingular = flatObjectMetadata.nameSingular;

    const relationNestedQueries = new RelationNestedQueries(writeRepository);

    const relationNestedConfig =
      relationNestedQueries.prepareNestedRelationQueries(records, nameSingular);

    if (!isDefined(relationNestedConfig)) {
      return records;
    }

    const resolvedRecords =
      await relationNestedQueries.processRelationNestedQueries({
        entities: records,
        relationNestedConfig,
        target: nameSingular,
        createRecords,
      });

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    return resolvedRecords.map((record) => {
      const columnKeyedRecord: Partial<ObjectRecord> = {};

      for (const [fieldName, value] of Object.entries(record)) {
        const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldIdByName[fieldName],
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (
          isDefined(fieldMetadata) &&
          (fieldMetadata.type === FieldMetadataType.RELATION ||
            fieldMetadata.type === FieldMetadataType.MORPH_RELATION)
        ) {
          continue;
        }

        columnKeyedRecord[fieldName] = value;
      }

      return columnKeyedRecord;
    });
  }

  protected async processNestedRelations({
    records,
    selection,
    queryRunnerContext,
    limit = QUERY_MAX_RECORDS_FROM_RELATION,
    repository,
  }: {
    records: ObjectRecord[];
    selection: CommonSelection;
    queryRunnerContext: Pick<
      CommonExtendedQueryRunnerContext,
      | 'flatObjectMetadataMaps'
      | 'flatFieldMetadataMaps'
      | 'flatObjectMetadata'
      | 'authContext'
    >;
    limit?: number;
    repository?: WorkspaceRepository;
  }): Promise<CommonRelationsAggregatedValues> {
    return this.processNestedRelationsHelper.processNestedRelations({
      flatObjectMetadataMaps: queryRunnerContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: queryRunnerContext.flatFieldMetadataMaps,
      parentObjectMetadataItem: queryRunnerContext.flatObjectMetadata,
      parentObjectRecords: records,
      selection,
      limit,
      authContext: queryRunnerContext.authContext,
      repository,
      ...this.getNestedRelationsReadPathOptions(),
    });
  }

  protected getNestedRelationsReadPathOptions(): NestedRelationsReadPathOptions {
    return {
      useReplica: this.isReadOnly,
    };
  }

  private recordApiComplexityUsage(
    authContext: WorkspaceAuthContext,
    computeQueryComplexity: () => number,
  ) {
    const apiType = getApiType();

    if (!isDefined(apiType) || !this.usageRecorderService.isEnabled()) {
      return;
    }

    this.usageRecorderService.accumulate(authContext.workspace.id, {
      resourceType: UsageResourceType.API,
      operationType: UsageOperationType.API_REQUEST,
      quantity: computeQueryComplexity() || 1,
      unit: UsageUnit.COMPLEXITY,
      resourceContext: apiType,
      spenders: buildUsageSpendersFromAuthContext(authContext),
    });
  }

  private async consumeApiSpeedLimit(authContext: WorkspaceAuthContext) {
    try {
      await this.usageLimitSpeedService.consumeOrThrow({
        resourceType: UsageResourceType.API,
        authContext,
        operationType: UsageOperationType.API_REQUEST,
      });
    } catch (error) {
      if (
        error instanceof UsageLimitException &&
        isDefined(error.exhaustedScope) &&
        error.exhaustedScope.isDefault
      ) {
        await this.reportApiSpeedCeilingHit({
          authContext,
          exhaustedScope: error.exhaustedScope,
        });
      }

      throw error;
    }
  }

  private async reportApiSpeedCeilingHit({
    authContext,
    exhaustedScope,
  }: {
    authContext: WorkspaceAuthContext;
    exhaustedScope: ExhaustedScope;
  }) {
    if (exhaustedScope.spenderType === 'apiKey') {
      await this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.CommonApiQueryRateLimited,
        shouldStoreInCache: false,
      });
    }

    if (
      exhaustedScope.spenderType === 'application' &&
      isApplicationAuthContext(authContext)
    ) {
      await this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.CommonApiApplicationQueryRateLimited,
        shouldStoreInCache: false,
        attributes: {
          universal_identifier: authContext.application.universalIdentifier,
          app_name: authContext.application.name,
          source_type: authContext.application.sourceType,
        },
      });

      this.logger.warn(
        buildApplicationApiRateLimitedLogLine({ authContext, exhaustedScope }),
      );

      this.applicationRepeatedEventRecorderService.record({
        entry: buildApplicationApiRateLimitedLogEntry({
          authContext,
          exhaustedScope,
        }),
      });
    }
  }

  private validateQueryComplexity(
    selectedFieldsResult: CommonSelectedFieldsResult,
    args: CommonExtendedInput<Args>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): void {
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
      queryRunnerContext,
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
