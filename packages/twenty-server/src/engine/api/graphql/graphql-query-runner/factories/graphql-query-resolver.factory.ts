import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import {
  ResolverArgs,
  WorkspaceResolverBuilderMethodNames,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryDestroyManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-many-resolver.service';
import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';
import { GraphqlQueryFindDuplicatesResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-duplicates-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { GraphqlQuerySearchResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-search-resolver.service';
import { GraphqlQueryUpdateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-many-resolver.service';
import { GraphqlQueryUpdateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-one-resolver.service';

@Injectable()
export class GraphqlQueryResolverFactory {
  constructor(private moduleRef: ModuleRef) {}

  public getResolver(
    operationName: WorkspaceResolverBuilderMethodNames,
  ): ResolverService<ResolverArgs, any> {
    switch (operationName) {
      case 'findOne':
        return this.moduleRef.get(GraphqlQueryFindOneResolverService);
      case 'findMany':
        return this.moduleRef.get(GraphqlQueryFindManyResolverService);
      case 'findDuplicates':
        return this.moduleRef.get(GraphqlQueryFindDuplicatesResolverService);
      case 'search':
        return this.moduleRef.get(GraphqlQuerySearchResolverService);
      case 'createOne':
      case 'createMany':
        return this.moduleRef.get(GraphqlQueryCreateManyResolverService);
      case 'destroyOne':
        return this.moduleRef.get(GraphqlQueryDestroyOneResolverService);
      case 'destroyMany':
        return this.moduleRef.get(GraphqlQueryDestroyManyResolverService);
      case 'updateOne':
      case 'deleteOne':
        return this.moduleRef.get(GraphqlQueryUpdateOneResolverService);
      case 'updateMany':
      case 'deleteMany':
      case 'restoreMany':
        return this.moduleRef.get(GraphqlQueryUpdateManyResolverService);
      default:
        throw new Error(`Unsupported operation: ${operationName}`);
    }
  }
}
