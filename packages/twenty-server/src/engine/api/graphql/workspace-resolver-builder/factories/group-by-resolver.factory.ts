import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { isDefined } from 'twenty-shared/utils';

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

    return async (_source, args, _context, info) => {
      const selectedFields = graphqlFields(info);

      const shouldIncludeRecords =
        isDefined(selectedFields.edges?.node) &&
        Object.keys(selectedFields.edges?.node).length > 0;

      try {
        const results = await this.commonGroupByQueryRunnerService.run({
          args: { ...args, selectedFields },
          authContext: internalContext.authContext,
          objectMetadataMaps: internalContext.objectMetadataMaps,
          objectMetadataItemWithFieldMaps:
            internalContext.objectMetadataItemWithFieldMaps,
          shouldIncludeRecords,
        });

        if (!shouldIncludeRecords) {
          return results;
        }

        const typeORMObjectRecordsParser =
          new ObjectRecordsToGraphqlConnectionHelper(
            internalContext.objectMetadataMaps,
          );

        const formattedResults = results.map((group) => {
          const formattedRecords = typeORMObjectRecordsParser.createConnection({
            objectRecords: group.records ?? [],
            objectName:
              internalContext.objectMetadataItemWithFieldMaps.nameSingular,
            objectRecordsAggregatedValues: {},
            selectedAggregatedFields: {},
            take: group.records?.length || 0,
            totalCount: group.records?.length || 0,
            hasNextPage: false,
            hasPreviousPage: false,
          });

          const { _records, ...groupWithoutRecords } = group;

          return {
            ...groupWithoutRecords,
            ...formattedRecords,
          };
        });

        return formattedResults;
      } catch (error) {
        return workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
