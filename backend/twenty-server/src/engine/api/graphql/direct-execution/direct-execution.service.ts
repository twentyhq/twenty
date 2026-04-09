import { Injectable } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { type Request } from 'express';
import {
  GraphQLError,
  type DocumentNode,
  type FieldNode,
  type GraphQLFormattedError,
  type GraphQLResolveInfo,
} from 'graphql';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import graphqlFields from 'graphql-fields';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import { assertCreateManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-create-many-args.util';
import { assertCreateOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-create-one-args.util';
import { assertDeleteManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-delete-many-args.util';
import { assertDeleteOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-delete-one-args.util';
import { assertDestroyManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-destroy-many-args.util';
import { assertDestroyOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-destroy-one-args.util';
import { assertFindDuplicatesArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-find-duplicates-args.util';
import { assertFindManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-find-many-args.util';
import { assertFindOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-find-one-args.util';
import { assertGroupByArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-group-by-args.util';
import { assertMergeManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-merge-many-args.util';
import { assertRestoreManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-restore-many-args.util';
import { assertRestoreOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-restore-one-args.util';
import { assertUpdateManyArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-update-many-args.util';
import { assertUpdateOneArgs } from 'src/engine/api/graphql/direct-execution/utils/assert-update-one-args.util';
import { type ResolverNameMapEntry } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { buildWorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/direct-execution/utils/build-workspace-schema-builder-context.util';
import { extractArgumentsFromAst } from 'src/engine/api/graphql/direct-execution/utils/extract-arguments-from-ast.util';
import { graphQLBuildFragmentMap } from 'src/engine/api/graphql/direct-execution/utils/graphql-build-fragment-map.util';
import { graphQLBuildPartialResolveInfo } from 'src/engine/api/graphql/direct-execution/utils/graphql-build-partial-resolve-info.util';
import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';
import { graphQLFormatResultFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-format-result-from-selected-fields.util';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { CreateManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/create-many-resolver.factory';
import { CreateOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/create-one-resolver.factory';
import { DeleteManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/delete-many-resolver.factory';
import { DeleteOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/delete-one-resolver.factory';
import { DestroyManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-many-resolver.factory';
import { DestroyOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-one-resolver.factory';
import { FindDuplicatesResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/find-duplicates-resolver.factory';
import { FindManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/find-many-resolver.factory';
import { FindOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/find-one-resolver.factory';
import { GroupByResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/group-by-resolver.factory';
import { MergeManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/merge-many-resolver.factory';
import { RestoreManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-many-resolver.factory';
import { RestoreOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-one-resolver.factory';
import { UpdateManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/update-many-resolver.factory';
import { UpdateOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/update-one-resolver.factory';
import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type DirectExecutionResult = {
  data?: Record<string, unknown>;
  errors?: GraphQLFormattedError[];
};

@Injectable()
export class DirectExecutionService {
  private readonly factoryMap: Map<
    string,
    WorkspaceResolverBuilderFactoryInterface
  >;

  private readonly argsAssertionMap: Map<string, (args: unknown) => void>;

  constructor(
    private readonly workspaceFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly i18nService: I18nService,
    private readonly findManyResolverFactory: FindManyResolverFactory,
    private readonly findOneResolverFactory: FindOneResolverFactory,
    private readonly findDuplicatesResolverFactory: FindDuplicatesResolverFactory,
    private readonly groupByResolverFactory: GroupByResolverFactory,
    private readonly createOneResolverFactory: CreateOneResolverFactory,
    private readonly createManyResolverFactory: CreateManyResolverFactory,
    private readonly updateOneResolverFactory: UpdateOneResolverFactory,
    private readonly updateManyResolverFactory: UpdateManyResolverFactory,
    private readonly deleteOneResolverFactory: DeleteOneResolverFactory,
    private readonly deleteManyResolverFactory: DeleteManyResolverFactory,
    private readonly destroyOneResolverFactory: DestroyOneResolverFactory,
    private readonly destroyManyResolverFactory: DestroyManyResolverFactory,
    private readonly restoreOneResolverFactory: RestoreOneResolverFactory,
    private readonly restoreManyResolverFactory: RestoreManyResolverFactory,
    private readonly mergeManyResolverFactory: MergeManyResolverFactory,
  ) {
    this.factoryMap = new Map<string, WorkspaceResolverBuilderFactoryInterface>(
      [
        [RESOLVER_METHOD_NAMES.FIND_MANY, this.findManyResolverFactory],
        [RESOLVER_METHOD_NAMES.FIND_ONE, this.findOneResolverFactory],
        [
          RESOLVER_METHOD_NAMES.FIND_DUPLICATES,
          this.findDuplicatesResolverFactory,
        ],
        [RESOLVER_METHOD_NAMES.GROUP_BY, this.groupByResolverFactory],
        [RESOLVER_METHOD_NAMES.CREATE_ONE, this.createOneResolverFactory],
        [RESOLVER_METHOD_NAMES.CREATE_MANY, this.createManyResolverFactory],
        [RESOLVER_METHOD_NAMES.UPDATE_ONE, this.updateOneResolverFactory],
        [RESOLVER_METHOD_NAMES.UPDATE_MANY, this.updateManyResolverFactory],
        [RESOLVER_METHOD_NAMES.DELETE_ONE, this.deleteOneResolverFactory],
        [RESOLVER_METHOD_NAMES.DELETE_MANY, this.deleteManyResolverFactory],
        [RESOLVER_METHOD_NAMES.DESTROY_ONE, this.destroyOneResolverFactory],
        [RESOLVER_METHOD_NAMES.DESTROY_MANY, this.destroyManyResolverFactory],
        [RESOLVER_METHOD_NAMES.RESTORE_ONE, this.restoreOneResolverFactory],
        [RESOLVER_METHOD_NAMES.RESTORE_MANY, this.restoreManyResolverFactory],
        [RESOLVER_METHOD_NAMES.MERGE_MANY, this.mergeManyResolverFactory],
      ],
    );

    this.argsAssertionMap = new Map<string, (args: unknown) => void>([
      [RESOLVER_METHOD_NAMES.FIND_MANY, assertFindManyArgs],
      [RESOLVER_METHOD_NAMES.FIND_ONE, assertFindOneArgs],
      [RESOLVER_METHOD_NAMES.FIND_DUPLICATES, assertFindDuplicatesArgs],
      [RESOLVER_METHOD_NAMES.GROUP_BY, assertGroupByArgs],
      [RESOLVER_METHOD_NAMES.CREATE_ONE, assertCreateOneArgs],
      [RESOLVER_METHOD_NAMES.CREATE_MANY, assertCreateManyArgs],
      [RESOLVER_METHOD_NAMES.UPDATE_ONE, assertUpdateOneArgs],
      [RESOLVER_METHOD_NAMES.UPDATE_MANY, assertUpdateManyArgs],
      [RESOLVER_METHOD_NAMES.DELETE_ONE, assertDeleteOneArgs],
      [RESOLVER_METHOD_NAMES.DELETE_MANY, assertDeleteManyArgs],
      [RESOLVER_METHOD_NAMES.DESTROY_ONE, assertDestroyOneArgs],
      [RESOLVER_METHOD_NAMES.DESTROY_MANY, assertDestroyManyArgs],
      [RESOLVER_METHOD_NAMES.RESTORE_ONE, assertRestoreOneArgs],
      [RESOLVER_METHOD_NAMES.RESTORE_MANY, assertRestoreManyArgs],
      [RESOLVER_METHOD_NAMES.MERGE_MANY, assertMergeManyArgs],
    ]);
  }

  async getGeneratedWorkspaceResolverNames(
    workspaceId: string,
  ): Promise<Set<string> | null> {
    const { graphQLResolverNameMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'graphQLResolverNameMap',
      ]);

    return new Set(Object.keys(graphQLResolverNameMap));
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

      const topLevelFields = graphQLExtractTopLevelFields(
        document,
        req.body.operationName,
      );

      this.checkRootResolverLimitsOrThrow(topLevelFields);

      const fragmentMap = graphQLBuildFragmentMap(document);
      const variables = req.body.variables ?? {};
      const data: Record<string, unknown> = {};

      const { graphQLResolverNameMap } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'graphQLResolverNameMap',
        ]);

      const {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      } = await this.loadWorkspaceMetadata(workspaceId);

      const results = await Promise.allSettled(
        topLevelFields.map(async (field) => {
          const entry = graphQLResolverNameMap[field.name.value];
          const responseKey = field.alias?.value ?? field.name.value;

          const args = extractArgumentsFromAst(field.arguments, variables);

          const graphqlPartialResolveInfo = graphQLBuildPartialResolveInfo(
            field,
            fragmentMap,
          );

          const workspaceSchemaBuilderContext =
            buildWorkspaceSchemaBuilderContext(
              entry,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              objectIdByNameSingular,
            );

          const result = await this.executeField({
            entry,
            args,
            graphqlPartialResolveInfo,
            workspaceSchemaBuilderContext,
          });

          const formattedResult = graphQLFormatResultFromSelectedFields(
            result,
            graphqlFields(
              graphqlPartialResolveInfo as GraphQLResolveInfo,
              {},
              { excludedFields: [] },
            ),
            workspaceSchemaBuilderContext.flatObjectMetadata.nameSingular,
            {
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              objectIdByNameSingular,
              method: entry.method,
            },
          );

          return { responseKey, result: formattedResult };
        }),
      );

      const errors: GraphQLFormattedError[] = [];

      for (const settled of results) {
        if (settled.status === 'fulfilled') {
          data[settled.value.responseKey] = settled.value.result;
        } else {
          errors.push(this.formatError(settled.reason, req));
        }
      }

      if (errors.length > 0) {
        return { data, errors };
      }

      return { data };
    } catch (error) {
      return { errors: [this.formatError(error, req)] };
    }
  }

  private async executeField({
    entry,
    args,
    graphqlPartialResolveInfo,
    workspaceSchemaBuilderContext,
  }: {
    entry: ResolverNameMapEntry;
    args: Record<string, unknown>;
    graphqlPartialResolveInfo: Pick<
      GraphQLResolveInfo,
      'fieldNodes' | 'fragments'
    >;
    workspaceSchemaBuilderContext: WorkspaceSchemaBuilderContext;
  }): Promise<unknown> {
    const factory = this.factoryMap.get(entry.method);
    const assertFunction = this.argsAssertionMap.get(entry.method);

    if (!isDefined(factory) || !isDefined(assertFunction)) {
      throw new GraphqlDirectExecutionException(
        `Unknown method: ${entry.method}`,
        GraphqlDirectExecutionExceptionCode.UNKNOWN_METHOD,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    assertFunction(args);

    const resolver = factory.create(workspaceSchemaBuilderContext);

    return resolver(
      null,
      args,
      null,
      graphqlPartialResolveInfo as GraphQLResolveInfo,
    );
  }

  private formatError(error: unknown, req: Request): GraphQLFormattedError {
    if (!(error instanceof Error)) {
      return {
        message: 'Internal server error',
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      };
    }

    try {
      workspaceQueryRunnerGraphqlApiExceptionHandler(error);
    } catch (graphqlError) {
      if (graphqlError instanceof GraphQLError) {
        const json = graphqlError.toJSON();

        if (json.extensions?.userFriendlyMessage) {
          const userLocale = req.locale ?? SOURCE_LOCALE;
          const i18n = this.i18nService.getI18nInstance(userLocale);

          json.extensions.userFriendlyMessage = i18n._(
            json.extensions.userFriendlyMessage as MessageDescriptor,
          );
        }

        return json;
      }
    }

    return {
      message: error.message,
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
        throw new UserInputError(`Duplicate root resolver: "${name}"`);
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
