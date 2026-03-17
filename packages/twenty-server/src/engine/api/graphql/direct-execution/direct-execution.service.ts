import { Injectable, Logger } from '@nestjs/common';

import {
  type DocumentNode,
  type FieldNode,
  type GraphQLFormattedError,
  type OperationDefinitionNode,
  GraphQLError,
  Kind,
  parse,
} from 'graphql';
import { type Request } from 'express';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { type ObjectRecord, OrderByDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import { CommonDestroyOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-one-query-runner.service';
import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { CommonRestoreOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-one-query-runner.service';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import {
  type ResolverNameMapEntry,
  buildResolverNameMap,
} from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import {
  buildFragmentMap,
  selectionSetToSelectedFields,
} from 'src/engine/api/graphql/direct-execution/utils/ast-to-selected-fields.util';
import { backfillNullsFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/backfill-nulls-from-selected-fields.util';
import { coerceArgsForDirectExecution } from 'src/engine/api/graphql/direct-execution/utils/coerce-args-for-direct-execution.util';
import { extractArgumentsFromAst } from 'src/engine/api/graphql/direct-execution/utils/extract-arguments-from-ast.util';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

type DirectExecutionResult = {
  data: Record<string, unknown> | null;
  errors?: GraphQLFormattedError[];
};

type ResolverNameMap = Map<string, ResolverNameMapEntry>;

@Injectable()
export class DirectExecutionService {
  private readonly logger = new Logger(DirectExecutionService.name);

  private resolverNameMapCache = new Map<string, ResolverNameMap>();

  constructor(
    private readonly workspaceFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly commonFindManyService: CommonFindManyQueryRunnerService,
    private readonly commonFindOneService: CommonFindOneQueryRunnerService,
    private readonly commonFindDuplicatesService: CommonFindDuplicatesQueryRunnerService,
    private readonly commonGroupByService: CommonGroupByQueryRunnerService,
    private readonly commonCreateOneService: CommonCreateOneQueryRunnerService,
    private readonly commonCreateManyService: CommonCreateManyQueryRunnerService,
    private readonly commonUpdateOneService: CommonUpdateOneQueryRunnerService,
    private readonly commonUpdateManyService: CommonUpdateManyQueryRunnerService,
    private readonly commonDeleteOneService: CommonDeleteOneQueryRunnerService,
    private readonly commonDeleteManyService: CommonDeleteManyQueryRunnerService,
    private readonly commonDestroyOneService: CommonDestroyOneQueryRunnerService,
    private readonly commonDestroyManyService: CommonDestroyManyQueryRunnerService,
    private readonly commonRestoreOneService: CommonRestoreOneQueryRunnerService,
    private readonly commonRestoreManyService: CommonRestoreManyQueryRunnerService,
    private readonly commonMergeManyService: CommonMergeManyQueryRunnerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  // Returns null when the query cannot be handled directly (fall through to normal pipeline)
  async execute(req: Request): Promise<DirectExecutionResult | null> {
    const startTime = performance.now();

    let document: DocumentNode;

    try {
      document = parse(req.body.query);
    } catch {
      return null;
    }

    const operationDefinition = this.findOperationDefinition(
      document,
      req.body.operationName,
    );

    if (
      !operationDefinition ||
      operationDefinition.operation === 'subscription'
    ) {
      return null;
    }

    const workspaceId = req.workspace?.id;

    if (!workspaceId) {
      return null;
    }

    const metadata = await this.loadWorkspaceMetadata(workspaceId);

    if (!metadata) {
      return null;
    }

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = metadata;

    const resolverNameMap = this.getOrBuildResolverNameMap(
      workspaceId,
      metadata.metadataVersion,
      flatObjectMetadataMaps,
    );

    const topLevelFields = operationDefinition.selectionSet.selections.filter(
      (selection): selection is FieldNode => selection.kind === Kind.FIELD,
    );

    // If any field doesn't match a known workspace resolver, fall through
    for (const field of topLevelFields) {
      if (!resolverNameMap.has(field.name.value)) {
        this.logger.debug(
          `Direct execution: falling through for unrecognized field "${field.name.value}"`,
        );

        return null;
      }
    }

    const rootResolverError = this.checkRootResolverLimits(topLevelFields);

    if (rootResolverError) {
      return { data: null, errors: [rootResolverError] };
    }

    const fragmentMap = buildFragmentMap(document);
    const variables = req.body.variables ?? {};
    const data: Record<string, unknown> = {};

    for (const field of topLevelFields) {
      const entry = resolverNameMap.get(field.name.value)!;
      const responseKey = field.alias?.value ?? field.name.value;

      const selectedFields = selectionSetToSelectedFields(
        field.selectionSet,
        fragmentMap,
      );
      const args = coerceArgsForDirectExecution(
        extractArgumentsFromAst(field.arguments, variables),
      );

      const fieldResult = await this.executeField(
        entry,
        args,
        selectedFields,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      );

      if (fieldResult.error) {
        return {
          data: null,
          errors: [fieldResult.error],
        };
      }

      data[responseKey] = fieldResult.data;
    }

    const duration = performance.now() - startTime;

    this.logger.debug(
      `Direct execution completed in ${duration.toFixed(1)}ms for operation "${req.body.operationName ?? 'anonymous'}"`,
    );

    return { data };
  }

  private async executeField(
    entry: ResolverNameMapEntry,
    args: Record<string, unknown>,
    selectedFields: Record<string, object>,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    objectIdByNameSingular: Record<string, string>,
  ): Promise<{ data?: unknown; error?: GraphQLFormattedError }> {
    const context: CommonBaseQueryRunnerContext = {
      authContext: getWorkspaceAuthContext(),
      flatObjectMetadata: entry.flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    };

    const helper = new ObjectRecordsToGraphqlConnectionHelper(
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    );

    try {
      const data = await this.dispatchAndFormat(
        entry.method,
        { ...args, selectedFields },
        context,
        helper,
      );

      backfillNullsFromSelectedFields(data, selectedFields);

      return { data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async dispatchAndFormat(
    method: string,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    args: any,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<unknown> {
    const objectName = context.flatObjectMetadata.nameSingular;

    switch (method) {
      case 'findMany': {
        const {
          records,
          aggregatedValues,
          totalCount,
          pageInfo,
          selectedFieldsResult,
        } = await this.commonFindManyService.execute(args, context);

        return helper.createConnection({
          objectRecords: records,
          objectRecordsAggregatedValues: aggregatedValues,
          selectedAggregatedFields: selectedFieldsResult.aggregate,
          objectName,
          take: args.first ?? args.last ?? QUERY_MAX_RECORDS,
          totalCount,
          order: args.orderBy,
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
        });
      }

      case 'findOne': {
        const record = await this.commonFindOneService.execute(args, context);

        return helper.processRecord({
          objectRecord: record,
          objectName,
          take: 1,
          totalCount: 1,
        });
      }

      case 'findDuplicates': {
        const paginatedDuplicates =
          await this.commonFindDuplicatesService.execute(args, context);

        return paginatedDuplicates.map(
          (duplicate: {
            records: ObjectRecord[];
            totalCount: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
          }) =>
            helper.createConnection({
              objectRecords: duplicate.records,
              objectName,
              take: duplicate.records.length,
              totalCount: duplicate.totalCount,
              order: [{ id: OrderByDirection.AscNullsFirst }],
              hasNextPage: duplicate.hasNextPage,
              hasPreviousPage: duplicate.hasPreviousPage,
            }),
        );
      }

      case 'groupBy': {
        const selectedFields = args.selectedFields as Record<
          string,
          // oxlint-disable-next-line @typescripttypescript/no-explicit-any
          any
        >;

        const shouldIncludeRecords =
          isDefined(selectedFields.edges?.node) &&
          Object.keys(selectedFields.edges?.node).length > 0;

        const results = await this.commonGroupByService.execute(
          { ...args, includeRecords: shouldIncludeRecords },
          context,
        );

        return results.map(
          // oxlint-disable-next-line @typescripttypescript/no-explicit-any
          (group: any) => {
            const formattedRecords = helper.createConnection({
              objectRecords: group.records ?? [],
              objectName,
              objectRecordsAggregatedValues: {},
              selectedAggregatedFields: {},
              take: group.records?.length || 0,
              totalCount: Number(group.totalCount ?? 0),
              hasNextPage: false,
              hasPreviousPage: false,
              order: args.orderByForRecords ?? [],
            });

            const { _records, ...groupWithoutRecords } = group;

            return {
              ...groupWithoutRecords,
              ...formattedRecords,
            };
          },
        );
      }

      case 'createOne': {
        const record = await this.commonCreateOneService.execute(args, context);

        return helper.processRecord({
          objectRecord: record,
          objectName,
          take: 1,
          totalCount: 1,
        });
      }

      case 'createMany': {
        const records = await this.commonCreateManyService.execute(
          args,
          context,
        );

        return records.map((record: ObjectRecord) =>
          helper.processRecord({
            objectRecord: record,
            objectName,
            take: 1,
            totalCount: 1,
          }),
        );
      }

      case 'updateOne': {
        const record = await this.commonUpdateOneService.execute(args, context);

        return helper.processRecord({
          objectRecord: record,
          objectName,
          take: 1,
          totalCount: 1,
        });
      }

      case 'updateMany': {
        const records = await this.commonUpdateManyService.execute(
          args,
          context,
        );

        return records.map((record: ObjectRecord) =>
          helper.processRecord({
            objectRecord: record,
            objectName,
            take: 1,
            totalCount: 1,
          }),
        );
      }

      case 'deleteOne': {
        const record = await this.commonDeleteOneService.execute(args, context);

        return helper.processRecord({
          objectRecord: record,
          objectName,
          take: 1,
          totalCount: 1,
        });
      }

      case 'deleteMany': {
        const records = await this.commonDeleteManyService.execute(
          args,
          context,
        );

        return records.map((record: ObjectRecord) =>
          helper.processRecord({
            objectRecord: record,
            objectName,
            take: 1,
            totalCount: 1,
          }),
        );
      }

      case 'destroyOne': {
        const record = await this.commonDestroyOneService.execute(
          args,
          context,
        );

        return helper.processRecord({
          objectRecord: record,
          objectName,
          take: 1,
          totalCount: 1,
        });
      }

      case 'destroyMany': {
        const records = await this.commonDestroyManyService.execute(
          args,
          context,
        );

        return records.map((record: ObjectRecord) =>
          helper.processRecord({
            objectRecord: record,
            objectName,
            take: 1,
            totalCount: 1,
          }),
        );
      }

      case 'restoreOne': {
        const record = await this.commonRestoreOneService.execute(
          args,
          context,
        );

        return helper.processRecord({
          objectRecord: record,
          objectName,
          take: 1,
          totalCount: 1,
        });
      }

      case 'restoreMany': {
        const records = await this.commonRestoreManyService.execute(
          args,
          context,
        );

        return records.map((record: ObjectRecord) =>
          helper.processRecord({
            objectRecord: record,
            objectName,
            take: 1,
            totalCount: 1,
          }),
        );
      }

      case 'mergeMany': {
        const record = await this.commonMergeManyService.execute(args, context);

        return helper.processRecord({
          objectRecord: record,
          objectName,
          take: 1,
          totalCount: 1,
        });
      }

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  private handleError(error: unknown): {
    data?: unknown;
    error: GraphQLFormattedError;
  } {
    this.logger.warn(
      `Direct execution error: ${error instanceof Error ? error.message : String(error)}`,
    );

    try {
      // The handler uses instanceof checks internally, so the cast is safe
      // oxlint-disable-next-line @typescripttypescript/no-explicit-any
      workspaceQueryRunnerGraphqlApiExceptionHandler(error as any);
    } catch (graphqlError) {
      if (graphqlError instanceof GraphQLError) {
        return { error: graphqlError.toJSON() };
      }
    }

    return {
      error: {
        message: 'Internal server error',
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      },
    };
  }

  // Root resolver count and duplicate checks -- these are NOT covered by
  // the Common API's validateQueryComplexity (which handles relation depth).
  private checkRootResolverLimits(
    topLevelFields: FieldNode[],
  ): GraphQLFormattedError | null {
    const maxRootResolvers = this.twentyConfigService.get(
      'GRAPHQL_MAX_ROOT_RESOLVERS',
    );

    if (
      isDefined(maxRootResolvers) &&
      topLevelFields.length > maxRootResolvers
    ) {
      return new UserInputError(
        `Query too complex - Too many root resolvers requested: ${topLevelFields.length} - Maximum allowed root resolvers: ${maxRootResolvers}`,
      ).toJSON();
    }

    const seen = new Set<string>();

    for (const field of topLevelFields) {
      const name = field.name.value;

      if (seen.has(name)) {
        return new UserInputError(
          `Duplicate root resolver: "${name}"`,
        ).toJSON();
      }

      seen.add(name);
    }

    return null;
  }

  private findOperationDefinition(
    document: DocumentNode,
    operationName: string | undefined,
  ): OperationDefinitionNode | undefined {
    const operations = document.definitions.filter(
      (definition): definition is OperationDefinitionNode =>
        definition.kind === Kind.OPERATION_DEFINITION,
    );

    if (operationName) {
      return operations.find(
        (operation) => operation.name?.value === operationName,
      );
    }

    return operations[0];
  }

  private async loadWorkspaceMetadata(workspaceId: string) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    if (
      !isDefined(flatObjectMetadataMaps) ||
      !isDefined(flatFieldMetadataMaps)
    ) {
      return null;
    }

    let metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (!isDefined(metadataVersion)) {
      metadataVersion = 0;
    }

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    return {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular: idByNameSingular,
      metadataVersion,
    };
  }

  private getOrBuildResolverNameMap(
    workspaceId: string,
    metadataVersion: number,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  ): ResolverNameMap {
    const cacheKey = `${workspaceId}:${metadataVersion}`;

    const cached = this.resolverNameMapCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Evict stale entries for this workspace
    for (const key of this.resolverNameMapCache.keys()) {
      if (key.startsWith(`${workspaceId}:`)) {
        this.resolverNameMapCache.delete(key);
      }
    }

    const map = buildResolverNameMap(flatObjectMetadataMaps);

    this.resolverNameMapCache.set(cacheKey, map);

    return map;
  }
}
