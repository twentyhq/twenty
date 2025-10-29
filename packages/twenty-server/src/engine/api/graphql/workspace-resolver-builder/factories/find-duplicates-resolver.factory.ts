import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { OrderByDirection } from 'twenty-shared/types';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type FindDuplicatesResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';

@Injectable()
export class FindDuplicatesResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.FIND_DUPLICATES;

  constructor(
    private readonly commonFindDuplicatesQueryRunnerService: CommonFindDuplicatesQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<FindDuplicatesResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
      const selectedFields = graphqlFields(info);

      try {
        const paginatedDuplicates =
          await this.commonFindDuplicatesQueryRunnerService.execute(
            { ...args, selectedFields },
            internalContext,
          );

        const typeORMObjectRecordsParser =
          new ObjectRecordsToGraphqlConnectionHelper(
            internalContext.objectMetadataMaps,
          );

        return paginatedDuplicates.map((duplicate) =>
          typeORMObjectRecordsParser.createConnection({
            objectRecords: duplicate.records,
            objectName:
              internalContext.objectMetadataItemWithFieldMaps.nameSingular,
            take: duplicate.records.length,
            totalCount: duplicate.totalCount,
            order: [{ id: OrderByDirection.AscNullsFirst }],
            hasNextPage: duplicate.hasNextPage,
            hasPreviousPage: duplicate.hasPreviousPage,
          }),
        );
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
