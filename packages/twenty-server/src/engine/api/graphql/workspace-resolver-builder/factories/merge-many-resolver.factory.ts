import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type MergeManyResolverArgs,
  type Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { computeResolverContext } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-resolver-context.util';

@Injectable()
export class MergeManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.MERGE_MANY;

  constructor(
    private readonly commonMergeManyQueryRunnerService: CommonMergeManyQueryRunnerService,
  ) {}

  create(
    workspaceSchemaBuilderContext: WorkspaceSchemaBuilderContext,
  ): Resolver<MergeManyResolverArgs> {
    return async (_source, args, _context, info) => {
      const selectedFields = graphqlFields(info);

      const resolverContext = computeResolverContext({
        workspaceSchemaBuilderContext,
        request: _context.req,
      });

      try {
        const record = await this.commonMergeManyQueryRunnerService.execute(
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
