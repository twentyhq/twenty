import { Injectable } from '@nestjs/common';

import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  CreateManyResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class GraphqlQueryRunnerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @LogExecutionTime()
  async findOne<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord | undefined> {
    const graphqlQueryFindOneResolverService =
      new GraphqlQueryFindOneResolverService(this.twentyORMGlobalManager);

    return graphqlQueryFindOneResolverService.findOne(args, options);
  }

  @LogExecutionTime()
  async findMany<
    ObjectRecord extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord>> {
    const graphqlQueryFindManyResolverService =
      new GraphqlQueryFindManyResolverService(this.twentyORMGlobalManager);

    return graphqlQueryFindManyResolverService.findMany(args, options);
  }

  @LogExecutionTime()
  async createMany<ObjectRecord extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord[] | undefined> {
    const graphqlQueryCreateManyResolverService =
      new GraphqlQueryCreateManyResolverService(this.twentyORMGlobalManager);

    return graphqlQueryCreateManyResolverService.createMany(args, options);
  }
}
