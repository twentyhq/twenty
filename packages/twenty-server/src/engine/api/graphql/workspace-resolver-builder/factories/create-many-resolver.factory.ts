import { Injectable } from '@nestjs/common';

import {
  CreateManyResolverArgs,
  Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';

import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';

@Injectable()
export class CreateManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'createMany' as const;

  constructor(
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<CreateManyResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      return this.workspaceQueryRunnerService.createMany(args, {
        objectMetadataItem: internalContext.objectMetadataItem,
        workspaceId: internalContext.workspaceId,
        userId: internalContext.userId,
        info,
        fieldMetadataCollection: internalContext.fieldMetadataCollection,
        objectMetadataCollection: internalContext.objectMetadataCollection,
      });
    };
  }
}
