import { Injectable } from '@nestjs/common';

import { type Request } from 'express';
import {
  type DocumentNode,
  type FieldNode,
  type GraphQLFormattedError,
  GraphQLError,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { DirectExecutionCreateManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-create-many.handler';
import { DirectExecutionCreateOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-create-one.handler';
import { DirectExecutionDeleteManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-delete-many.handler';
import { DirectExecutionDeleteOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-delete-one.handler';
import { DirectExecutionDestroyManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-destroy-many.handler';
import { DirectExecutionDestroyOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-destroy-one.handler';
import { DirectExecutionFindDuplicatesHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-find-duplicates.handler';
import { DirectExecutionFindManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-find-many.handler';
import { DirectExecutionFindOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-find-one.handler';
import { DirectExecutionGroupByHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-group-by.handler';
import { DirectExecutionMergeManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-merge-many.handler';
import { DirectExecutionRestoreManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-restore-many.handler';
import { DirectExecutionRestoreOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-restore-one.handler';
import { DirectExecutionUpdateManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-update-many.handler';
import { DirectExecutionUpdateOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-update-one.handler';
import {
  buildFragmentMap,
  selectionSetToSelectedFields,
} from 'src/engine/api/graphql/direct-execution/utils/ast-to-selected-fields.util';
import { backfillNullsFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/backfill-nulls-from-selected-fields.util';
import { type ResolverNameMapEntry } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { coerceArgsForDirectExecution } from 'src/engine/api/graphql/direct-execution/utils/coerce-args-for-direct-execution.util';
import { extractArgumentsFromAst } from 'src/engine/api/graphql/direct-execution/utils/extract-arguments-from-ast.util';
import { parseTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/parse-top-level-fields.util';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type DirectExecutionResult = {
  data: Record<string, unknown> | null;
  errors?: GraphQLFormattedError[];
};

@Injectable()
export class DirectExecutionService {
  private readonly handlerMap: Map<string, DirectExecutionBaseHandler>;

  constructor(
    private readonly workspaceFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly findManyHandler: DirectExecutionFindManyHandler,
    private readonly findOneHandler: DirectExecutionFindOneHandler,
    private readonly findDuplicatesHandler: DirectExecutionFindDuplicatesHandler,
    private readonly groupByHandler: DirectExecutionGroupByHandler,
    private readonly createOneHandler: DirectExecutionCreateOneHandler,
    private readonly createManyHandler: DirectExecutionCreateManyHandler,
    private readonly updateOneHandler: DirectExecutionUpdateOneHandler,
    private readonly updateManyHandler: DirectExecutionUpdateManyHandler,
    private readonly deleteOneHandler: DirectExecutionDeleteOneHandler,
    private readonly deleteManyHandler: DirectExecutionDeleteManyHandler,
    private readonly destroyOneHandler: DirectExecutionDestroyOneHandler,
    private readonly destroyManyHandler: DirectExecutionDestroyManyHandler,
    private readonly restoreOneHandler: DirectExecutionRestoreOneHandler,
    private readonly restoreManyHandler: DirectExecutionRestoreManyHandler,
    private readonly mergeManyHandler: DirectExecutionMergeManyHandler,
  ) {
    this.handlerMap = new Map<string, DirectExecutionBaseHandler>([
      [RESOLVER_METHOD_NAMES.FIND_MANY, this.findManyHandler],
      [RESOLVER_METHOD_NAMES.FIND_ONE, this.findOneHandler],
      [RESOLVER_METHOD_NAMES.FIND_DUPLICATES, this.findDuplicatesHandler],
      [RESOLVER_METHOD_NAMES.GROUP_BY, this.groupByHandler],
      [RESOLVER_METHOD_NAMES.CREATE_ONE, this.createOneHandler],
      [RESOLVER_METHOD_NAMES.CREATE_MANY, this.createManyHandler],
      [RESOLVER_METHOD_NAMES.UPDATE_ONE, this.updateOneHandler],
      [RESOLVER_METHOD_NAMES.UPDATE_MANY, this.updateManyHandler],
      [RESOLVER_METHOD_NAMES.DELETE_ONE, this.deleteOneHandler],
      [RESOLVER_METHOD_NAMES.DELETE_MANY, this.deleteManyHandler],
      [RESOLVER_METHOD_NAMES.DESTROY_ONE, this.destroyOneHandler],
      [RESOLVER_METHOD_NAMES.DESTROY_MANY, this.destroyManyHandler],
      [RESOLVER_METHOD_NAMES.RESTORE_ONE, this.restoreOneHandler],
      [RESOLVER_METHOD_NAMES.RESTORE_MANY, this.restoreManyHandler],
      [RESOLVER_METHOD_NAMES.MERGE_MANY, this.mergeManyHandler],
    ]);
  }

  async getGeneratedWorkspaceResolverNames(
    workspaceId: string,
  ): Promise<Set<string> | null> {
    const { resolverNameMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['resolverNameMap'],
    );

    return new Set(Object.keys(resolverNameMap));
  }

  async execute(
    req: Request,
    document: DocumentNode,
  ): Promise<DirectExecutionResult | null> {
    try {
      const workspaceId = req.workspace?.id;

      if (!isDefined(workspaceId)) {
        return null;
      }

      const topLevelFields = parseTopLevelFields(
        document,
        req.body.operationName,
      );

      this.checkRootResolverLimitsOrThrow(topLevelFields);

      const fragmentMap = buildFragmentMap(document);
      const variables = req.body.variables ?? {};
      const data: Record<string, unknown> = {};

      const { resolverNameMap } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'resolverNameMap',
        ]);

      const {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      } = await this.loadWorkspaceMetadata(workspaceId);

      for (const field of topLevelFields) {
        const entry = resolverNameMap[field.name.value];
        const responseKey = field.alias?.value ?? field.name.value;

        const selectedFields = selectionSetToSelectedFields(
          field.selectionSet,
          fragmentMap,
        );
        const args = coerceArgsForDirectExecution(
          extractArgumentsFromAst(field.arguments, variables),
        );

        try {
          data[responseKey] = await this.executeField(
            entry,
            { ...args, selectedFields },
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            objectIdByNameSingular,
          );

          backfillNullsFromSelectedFields(data[responseKey], selectedFields);
        } catch (error) {
          data[responseKey] = null;

          return { data, errors: [this.formatError(error)] };
        }
      }

      return { data };
    } catch (error) {
      return { data: null, errors: [this.formatError(error)] };
    }
  }

  private async executeField(
    entry: ResolverNameMapEntry,
    args: Record<string, unknown>,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    objectIdByNameSingular: Record<string, string>,
  ): Promise<unknown> {
    const handler = this.handlerMap.get(entry.method);

    if (!handler) {
      throw new Error(`Unknown method: ${entry.method}`);
    }

    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        entry.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      throw new Error(
        `Object metadata not found for universal identifier: ${entry.objectMetadataUniversalIdentifier}`,
      );
    }

    const context: CommonBaseQueryRunnerContext = {
      authContext: getWorkspaceAuthContext(),
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    };

    const helper = new ObjectRecordsToGraphqlConnectionHelper(
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    );

    return handler.handle(args, context, helper);
  }

  private formatError(error: any): GraphQLFormattedError {
    try {
      workspaceQueryRunnerGraphqlApiExceptionHandler(error);
    } catch (graphqlError) {
      if (graphqlError instanceof GraphQLError) {
        return graphqlError.toJSON();
      }
    }

    return {
      message: isDefined(error.message)
        ? error.message
        : 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
  }

  private checkRootResolverLimitsOrThrow(topLevelFields: FieldNode[]): void {
    const maxRootResolvers = this.twentyConfigService.get(
      'GRAPHQL_MAX_ROOT_RESOLVERS',
    );

    if (
      isDefined(maxRootResolvers) &&
      topLevelFields.length > maxRootResolvers
    ) {
      throw new UserInputError(
        `Query too complex - Too many root resolvers requested: ${topLevelFields.length} - Maximum allowed root resolvers: ${maxRootResolvers}`,
      );
    }

    const seen = new Set<string>();

    for (const field of topLevelFields) {
      const name = field.name.value;

      if (seen.has(name)) {
        throw new UserInputError(`Duplicate root resolver: "${name}"`).toJSON();
      }

      seen.add(name);
    }
  }

  private async loadWorkspaceMetadata(workspaceId: string) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    return {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular: idByNameSingular,
    };
  }
}
