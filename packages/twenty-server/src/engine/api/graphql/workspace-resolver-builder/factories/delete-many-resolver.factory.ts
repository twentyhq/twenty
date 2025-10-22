import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { ObjectRecord } from 'twenty-shared/types';

import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type DeleteManyResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { GraphqlQueryDeleteManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-delete-many-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class DeleteManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.DELETE_MANY;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQueryDeleteManyResolverService,
    private readonly commonDeleteManyQueryRunnerService: CommonDeleteManyQueryRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<DeleteManyResolverArgs> {
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
          const records = await this.commonDeleteManyQueryRunnerService.execute(
            { ...args, selectedFields },
            internalContext,
            CommonQueryNames.DELETE_MANY,
          );

          const typeORMObjectRecordsParser =
            new ObjectRecordsToGraphqlConnectionHelper(
              internalContext.objectMetadataMaps,
            );

          return records.map((record: ObjectRecord) =>
            typeORMObjectRecordsParser.processRecord({
              objectRecord: record,
              objectName:
                internalContext.objectMetadataItemWithFieldMaps.nameSingular,
              take: 1,
              totalCount: 1,
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
        DeleteManyResolverFactory.methodName,
      );
    };
  }
}
