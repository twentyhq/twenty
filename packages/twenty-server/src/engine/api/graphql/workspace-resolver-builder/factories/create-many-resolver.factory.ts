import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type CreateManyResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class CreateManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.CREATE_MANY;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQueryCreateManyResolverService,
    private readonly commonCreateManyQueryRunnerService: CommonCreateManyQueryRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<CreateManyResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
      const workspaceDataSource =
        await this.twentyORMGlobalManager.getDataSourceForWorkspace({
          workspaceId: internalContext.authContext.workspace?.id as string,
        });

      const featureFlagsMap = workspaceDataSource.featureFlagMap;

      if (featureFlagsMap[FeatureFlagKey.IS_COMMON_API_ENABLED]) {
        const graphqlQueryParser = new GraphqlQueryParser(
          internalContext.objectMetadataItemWithFieldMaps,
          internalContext.objectMetadataMaps,
        );

        const selectedFieldsResult = graphqlQueryParser.parseSelectedFields(
          internalContext.objectMetadataItemWithFieldMaps,
          graphqlFields(info),
          internalContext.objectMetadataMaps,
        );

        try {
          const records = await this.commonCreateManyQueryRunnerService.run({
            args: { ...args, selectedFieldsResult },
            authContext: internalContext.authContext,
            objectMetadataMaps: internalContext.objectMetadataMaps,
            objectMetadataItemWithFieldMaps:
              internalContext.objectMetadataItemWithFieldMaps,
          });

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
        CreateManyResolverFactory.methodName,
      );
    };
  }
}
