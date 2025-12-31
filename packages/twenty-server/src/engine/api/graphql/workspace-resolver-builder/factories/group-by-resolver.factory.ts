import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import graphqlFields from 'graphql-fields';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  GroupByResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { createQueryRunnerContext } from 'src/engine/api/graphql/workspace-resolver-builder/utils/create-query-runner-context.util';

@Injectable()
export class GroupByResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.GROUP_BY;

  constructor(
    private readonly commonGroupByQueryRunnerService: CommonGroupByQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<GroupByResolverArgs> {
    const internalContext = context;

    return async (_source, args, requestContext, info) => {
      const selectedFields = graphqlFields(info);

      const resolverContext = createQueryRunnerContext({
        workspaceSchemaBuilderContext: internalContext,
        request: requestContext.req,
      });

      const shouldIncludeRecords =
        isDefined(selectedFields.edges?.node) &&
        Object.keys(selectedFields.edges?.node).length > 0;

      try {
        const typeORMObjectRecordsParser =
          new ObjectRecordsToGraphqlConnectionHelper(
            resolverContext.flatObjectMetadataMaps,
            resolverContext.flatFieldMetadataMaps,
            resolverContext.objectIdByNameSingular,
          );

        const results = await this.commonGroupByQueryRunnerService.execute(
          { ...args, selectedFields, includeRecords: shouldIncludeRecords },
          resolverContext,
        );

        const formattedResults = results.map((group) => {
          const formattedRecords = typeORMObjectRecordsParser.createConnection({
            objectRecords: group.records ?? [],
            objectName: resolverContext.flatObjectMetadata.nameSingular,
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
        });

        return formattedResults;
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
