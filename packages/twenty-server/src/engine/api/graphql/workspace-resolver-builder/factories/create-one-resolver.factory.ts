import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type CreateOneResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { GraphqlQueryCreateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-one-resolver.service';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class CreateOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.CREATE_ONE;

  constructor(
    private readonly graphqlQueryRunnerService: GraphqlQueryCreateOneResolverService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly commonCreateOneQueryRunnerService: CommonCreateOneQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<CreateOneResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
      const isCommonApiEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_COMMON_API_ENABLED,
        internalContext.authContext.workspace?.id as string,
      );

      if (isCommonApiEnabled) {
        const selectedFields = graphqlFields(info);

        try {
          const record = await this.commonCreateOneQueryRunnerService.run({
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

          return typeORMObjectRecordsParser.processRecord({
            objectRecord: record,
            objectName:
              internalContext.objectMetadataItemWithFieldMaps.nameSingular,
            take: 1,
            totalCount: 1,
          });
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
        CreateOneResolverFactory.methodName,
      );
    };
  }
}
