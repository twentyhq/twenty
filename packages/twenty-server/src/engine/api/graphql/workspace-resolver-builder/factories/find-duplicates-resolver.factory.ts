import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { OrderByDirection } from 'twenty-shared/types';

import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type FindDuplicatesResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { GraphqlQueryFindDuplicatesResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-duplicates-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class FindDuplicatesResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.FIND_DUPLICATES;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQueryFindDuplicatesResolverService,
    private readonly commonFindDuplicatesQueryRunnerService: CommonFindDuplicatesQueryRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<FindDuplicatesResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
      const workspaceDataSource =
        await this.twentyORMGlobalManager.getDataSourceForWorkspace({
          workspaceId: internalContext.authContext.workspace?.id as string,
        });

      const featureFlagsMap = workspaceDataSource.featureFlagMap;

      if (featureFlagsMap[FeatureFlagKey.IS_COMMON_API_ENABLED]) {
        const selectedFields = graphqlFields(info);

        try {
          const paginatedDuplicates =
            await this.commonFindDuplicatesQueryRunnerService.run({
              args: { ...args, selectedFields },
              authContext: internalContext.authContext,
              objectMetadataMaps: internalContext.objectMetadataMaps,
              objectMetadataItemWithFieldMaps:
                internalContext.objectMetadataItemWithFieldMaps,
            });

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
          return workspaceQueryRunnerGraphqlApiExceptionHandler(error);
        }
      }

      const options: WorkspaceQueryRunnerOptions = {
        authContext: internalContext.authContext,
        info,
        objectMetadataMaps: internalContext.objectMetadataMaps,
        objectMetadataItemWithFieldMaps:
          internalContext.objectMetadataItemWithFieldMaps,
      };

      return await this.graphqlQueryRunnerService.execute(
        args,
        options,
        FindDuplicatesResolverFactory.methodName,
      );
    };
  }
}
