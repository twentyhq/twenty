import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type FindManyResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { createQueryRunnerContext } from 'src/engine/api/graphql/workspace-resolver-builder/utils/create-query-runner-context.util';

@Injectable()
export class FindManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.FIND_MANY;

  constructor(
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<FindManyResolverArgs> {
    const internalContext = context;

    return async (_source, args, requestContext, info) => {
      const selectedFields = graphqlFields(info);

      const resolverContext = createQueryRunnerContext({
        workspaceSchemaBuilderContext: internalContext,
        request: requestContext.req,
      });

      try {
        const {
          records,
          aggregatedValues,
          totalCount,
          pageInfo,
          selectedFieldsResult,
        } = await this.commonFindManyQueryRunnerService.execute(
          { ...args, selectedFields },
          resolverContext,
        );

        const typeORMObjectRecordsParser =
          new ObjectRecordsToGraphqlConnectionHelper(
            resolverContext.flatObjectMetadataMaps,
            resolverContext.flatFieldMetadataMaps,
            resolverContext.objectIdByNameSingular,
          );

        return typeORMObjectRecordsParser.createConnection({
          objectRecords: records,
          objectRecordsAggregatedValues: aggregatedValues,
          selectedAggregatedFields: selectedFieldsResult.aggregate,
          objectName: resolverContext.flatObjectMetadata.nameSingular,
          take: args.first ?? args.last ?? QUERY_MAX_RECORDS,
          totalCount,
          order: args.orderBy,
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
        });
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
