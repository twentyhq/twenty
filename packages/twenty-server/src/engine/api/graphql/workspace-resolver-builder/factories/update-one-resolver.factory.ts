import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type Resolver,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { createQueryRunnerContext } from 'src/engine/api/graphql/workspace-resolver-builder/utils/create-query-runner-context.util';

@Injectable()
export class UpdateOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.UPDATE_ONE;

  constructor(
    private readonly commonUpdateOneQueryRunnerService: CommonUpdateOneQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<UpdateOneResolverArgs> {
    const internalContext = context;

    return async (_source, args, requestContext, info) => {
      const selectedFields = graphqlFields(info);

      const resolverContext = createQueryRunnerContext({
        workspaceSchemaBuilderContext: internalContext,
        request: requestContext.req,
      });

      try {
        const record = await this.commonUpdateOneQueryRunnerService.execute(
          { ...args, selectedFields },
          resolverContext,
        );

        const typeORMObjectRecordsParser =
          new ObjectRecordsToGraphqlConnectionHelper(
            resolverContext.flatObjectMetadataMaps,
            resolverContext.flatFieldMetadataMaps,
            resolverContext.objectIdByNameSingular,
          );

        return typeORMObjectRecordsParser.processRecord({
          objectRecord: record,
          objectName: resolverContext.flatObjectMetadata.nameSingular,
          take: 1,
          totalCount: 1,
        });
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
