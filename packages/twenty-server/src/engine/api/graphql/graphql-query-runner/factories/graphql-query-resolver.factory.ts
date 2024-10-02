import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';
import { GraphqlQueryFindDuplicatesResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-duplicates-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { GraphqlQueryUpdateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-many-resolver.service';
import { GraphqlQueryUpdateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-one-resolver.service';

@Injectable()
export class GraphqlQueryResolverFactory {
  constructor(private moduleRef: ModuleRef) {}

  public getResolver(
    operationName: WorkspaceResolverBuilderMethodNames,
  ): ResolverService<any, any> {
    switch (operationName) {
      case 'findOne':
        return this.moduleRef.get(GraphqlQueryFindOneResolverService);
      case 'findMany':
        return this.moduleRef.get(GraphqlQueryFindManyResolverService);
      case 'findDuplicates':
        return this.moduleRef.get(GraphqlQueryFindDuplicatesResolverService);
      case 'createOne':
      case 'createMany':
        return this.moduleRef.get(GraphqlQueryCreateManyResolverService);
      case 'destroyOne':
        return this.moduleRef.get(GraphqlQueryDestroyOneResolverService);
      case 'updateOne':
      case 'deleteOne':
        return this.moduleRef.get(GraphqlQueryUpdateOneResolverService);
      case 'updateMany':
      case 'deleteMany':
        return this.moduleRef.get(GraphqlQueryUpdateManyResolverService);
      default:
        throw new Error(`Unsupported operation: ${operationName}`);
    }
  }
}
