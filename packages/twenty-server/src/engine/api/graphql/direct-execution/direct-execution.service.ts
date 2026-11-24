import { createHash } from 'crypto';

import { Injectable } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { type Histogram } from '@opentelemetry/api';
import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import {
  GraphQLError,
  buildSchema,
  execute,
  type DocumentNode,
  type FieldNode,
  type GraphQLFormattedError,
} from 'graphql';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ResolverNameMapEntry } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { buildWorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/direct-execution/utils/build-workspace-schema-builder-context.util';
import { computeGraphQLDirectExecutionQueryCost } from 'src/engine/api/graphql/direct-execution/utils/compute-graphql-direct-execution-query-cost.util';
import { extractArgumentsFromAst } from 'src/engine/api/graphql/direct-execution/utils/extract-arguments-from-ast.util';
import { applyGraphqlVariableDefaults } from 'src/engine/api/graphql/direct-execution/utils/apply-graphql-variable-defaults.util';
import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';
import { graphQLBuildFragmentMap } from 'src/engine/api/graphql/direct-execution/utils/graphql-build-fragment-map.util';
import { graphQLBuildPartialResolveInfo } from 'src/engine/api/graphql/direct-execution/utils/graphql-build-partial-resolve-info.util';
import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';
import { graphQLFormatResultFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-format-result-from-selected-fields.util';
import { getGraphqlFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-graphql-field-selections.util';
import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { WorkspaceResolverRunnerService } from 'src/engine/api/graphql/direct-execution/services/workspace-resolver-runner.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { getGraphqlOperationMetricKeyFromErrorCode } from 'src/engine/core-modules/graphql/utils/get-graphql-operation-metric-key-from-error-code.util';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

export type DirectExecutionResult = {
  data?: Record<string, unknown>;
  errors?: GraphQLFormattedError[];
};

const QUERY_COST_BUCKETS = [
  10, 50, 100, 250, 500, 1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000,
  250_000,
];
const QUERY_FINGERPRINT_MIN_COST = 5000;

@Injectable()
export class DirectExecutionService {
  private readonly queryCostHistogram: Histogram;

  constructor(
    private readonly workspaceFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceGraphqlSchemaSDLService: WorkspaceGraphqlSchemaSDLService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly i18nService: I18nService,
    private readonly metricsService: MetricsService,
    private readonly workspaceResolverRunnerService: WorkspaceResolverRunnerService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {
    this.queryCostHistogram = this.metricsService
      .getMeter()
      .createHistogram(
        'twenty_graphql_direct_execution_estimated_result_field_count',
        {
          description:
            'Estimated number of result field values produced by a directly executed GraphQL request',
          advice: { explicitBucketBoundaries: QUERY_COST_BUCKETS },
        },
      );
  }

  async getWorkspaceResolverNames(
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
    hasIntrospectionFields: boolean,
    hasWorkspaceFields: boolean,
  ): Promise<DirectExecutionResult | null> {
    const [introspectionResult, workspaceResult] = await Promise.all([
      hasIntrospectionFields
        ? this.executeIntrospectionQuery(req, document)
        : null,
      hasWorkspaceFields ? this.executeWorkspaceQuery(req, document) : null,
    ]);

    return this.mergeDirectExecutionResults(
      introspectionResult,
      workspaceResult,
    );
  }

  recordOperationMetrics(result: Pick<DirectExecutionResult, 'errors'>): void {
    if (!isNonEmptyArray(result.errors)) {
      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.GraphqlOperation200,
      });

      return;
    }

    for (const error of result.errors) {
      void this.metricsService.incrementCounterForEvent({
        key:
          getGraphqlOperationMetricKeyFromErrorCode(error.extensions?.code) ??
          MetricsKeys.GraphqlOperationUnknown,
      });
    }
  }

  private async executeWorkspaceQuery(
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
      const variables = applyGraphqlVariableDefaults(
        findOperationDefinition(document, req.body.operationName),
        req.body.variables ?? {},
      );
      const data: Record<string, unknown> = {};

      const {
        graphQLResolverNameMap,
        flatObjectMetadataMaps,
        flatFieldMetadataMapsOrm: flatFieldMetadataMaps,
        flatIndexMaps,
      } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'graphQLResolverNameMap',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
        'flatIndexMaps',
      ]);

      const { idByNameSingular: objectIdByNameSingular } =
        buildObjectIdByNameMaps(flatObjectMetadataMaps);

      this.recordQueryCost({
        document,
        fragmentMap,
        topLevelFields,
        variables,
        graphQLResolverNameMap,
      });

      const errors: GraphQLFormattedError[] = [];

      await Promise.all(
        topLevelFields.map(async (field) => {
          const entry = graphQLResolverNameMap[field.name.value];
          const responseKey = field.alias?.value ?? field.name.value;

          try {
            const args = extractArgumentsFromAst(field.arguments, variables);

            const graphqlPartialResolveInfo = graphQLBuildPartialResolveInfo({
              field,
              fragmentMap,
              variableValues: variables,
            });

            const workspaceSchemaBuilderContext =
              buildWorkspaceSchemaBuilderContext(
                entry,
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
                flatIndexMaps,
                objectIdByNameSingular,
              );

            const fieldSelections = getGraphqlFieldSelections(
              graphqlPartialResolveInfo,
            );

            data[responseKey] = graphQLFormatResultFromSelectedFields({
              result: await this.workspaceResolverRunnerService.run({
                method: entry.method,
                args,
                fieldSelections,
                workspaceSchemaBuilderContext,
              }),
              fieldSelections,
              flatObjectMetadata:
                workspaceSchemaBuilderContext.flatObjectMetadata,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            });
          } catch (error) {
            data[responseKey] = null;
            errors.push(this.formatError(error, req));
          }
        }),
      );

      if (errors.length > 0) {
        return { data, errors };
      }

      return { data };
    } catch (error) {
      return { errors: [this.formatError(error, req)] };
    }
  }

  private async executeIntrospectionQuery(
    req: Request,
    document: DocumentNode,
  ): Promise<DirectExecutionResult | null> {
    try {
      if (!isDefined(req.workspace)) {
        return null;
      }

      const schemaSDLResult =
        await this.workspaceGraphqlSchemaSDLService.getOrComputeSchemaSDL(
          req.workspace,
          req.application?.id ?? undefined,
        );

      if (!isDefined(schemaSDLResult)) {
        return null;
      }

      const schema = buildSchema(schemaSDLResult.sdl);
      const result = await execute({
        schema,
        document,
        operationName: req.body?.operationName as string | undefined,
        variableValues: (req.body?.variables as Record<string, unknown>) ?? {},
      });

      return {
        data: result.data as Record<string, unknown> | undefined,
        errors: result.errors?.map((error) => error.toJSON()),
      };
    } catch (error) {
      return { errors: [this.formatError(error, req)] };
    }
  }

  private mergeDirectExecutionResults(
    introspectionResult: DirectExecutionResult | null,
    workspaceResult: DirectExecutionResult | null,
  ): DirectExecutionResult | null {
    if (!introspectionResult && !workspaceResult) {
      return null;
    }

    const errors = [
      ...(introspectionResult?.errors ?? []),
      ...(workspaceResult?.errors ?? []),
    ];

    return {
      data: {
        ...introspectionResult?.data,
        ...workspaceResult?.data,
      },
      ...(errors.length > 0 ? { errors } : {}),
    };
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
        if (shouldCaptureException(graphqlError)) {
          this.exceptionHandlerService.captureExceptions([error]);
        }

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

    if (shouldCaptureException(error)) {
      this.exceptionHandlerService.captureExceptions([error]);
    }

    return {
      message: error.message,
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
  }

  private recordQueryCost({
    document,
    fragmentMap,
    topLevelFields,
    variables,
    graphQLResolverNameMap,
  }: {
    document: DocumentNode;
    fragmentMap: ReturnType<typeof graphQLBuildFragmentMap>;
    topLevelFields: FieldNode[];
    variables: Record<string, unknown>;
    graphQLResolverNameMap: Record<string, ResolverNameMapEntry>;
  }): void {
    const queryCost = computeGraphQLDirectExecutionQueryCost({
      rootFields: topLevelFields.flatMap((field) => {
        const entry = graphQLResolverNameMap[field.name.value];

        if (!isDefined(entry)) {
          return [];
        }

        return [
          {
            field,
            method: entry.method,
            args: extractArgumentsFromAst(field.arguments, variables),
          },
        ];
      }),
      fragmentMap,
    });

    this.queryCostHistogram.record(queryCost.estimatedResultFieldCount);

    const query = document.loc?.source.body;

    Sentry.getActiveSpan()?.setAttributes({
      'graphql.direct_execution.estimated_result_field_count':
        queryCost.estimatedResultFieldCount,
      ...(isDefined(query) &&
        queryCost.estimatedResultFieldCount >= QUERY_FINGERPRINT_MIN_COST && {
          'graphql.direct_execution.query_fingerprint': createHash('sha256')
            .update(query)
            .digest('hex')
            .slice(0, 16),
        }),
      'graphql.direct_execution.requested_row_count':
        queryCost.requestedRowCount,
      'graphql.direct_execution.selected_leaf_field_count':
        queryCost.selectedLeafFieldCount,
    });
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
}
