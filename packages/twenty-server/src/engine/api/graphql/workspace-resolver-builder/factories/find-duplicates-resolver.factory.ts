import { Injectable } from '@nestjs/common';

import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  FindDuplicatesResolverArgs,
  Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';

@Injectable()
export class FindDuplicatesResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'findDuplicates' as const;

  constructor(
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<FindDuplicatesResolverArgs> {
    const internalContext = context;

    return async (_source, args, context, info) => {
      try {
        return await this.workspaceQueryRunnerService.findDuplicates(args, {
          authContext: internalContext.authContext,
          objectMetadataItem: internalContext.objectMetadataItem,
          info,
          fieldMetadataCollection: internalContext.fieldMetadataCollection,
          objectMetadataCollection: internalContext.objectMetadataCollection,
        });
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
