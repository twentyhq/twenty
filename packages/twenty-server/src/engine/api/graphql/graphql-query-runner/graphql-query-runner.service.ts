import { Injectable } from '@nestjs/common';

import {
  ObjectRecord,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DeleteManyResolverArgs,
  DeleteOneResolverArgs,
  DestroyManyResolverArgs,
  DestroyOneResolverArgs,
  FindDuplicatesResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  ResolverArgs,
  ResolverArgsType,
  RestoreManyResolverArgs,
  SearchResolverArgs,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
  WorkspaceResolverBuilderMethodNames,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryResolverFactory } from 'src/engine/api/graphql/graphql-query-runner/factories/graphql-query-resolver.factory';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { capitalize } from 'src/utils/capitalize';

@Injectable()
export class GraphqlQueryRunnerService {
  constructor(
    private readonly workspaceQueryHookService: WorkspaceQueryHookService,
    private readonly queryRunnerArgsFactory: QueryRunnerArgsFactory,
    private readonly queryResultGettersFactory: QueryResultGettersFactory,
    private readonly graphqlQueryResolverFactory: GraphqlQueryResolverFactory,
  ) {}

  /** QUERIES */

  @LogExecutionTime()
  async findOne<T extends ObjectRecord, Filter extends ObjectRecordFilter>(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T> {
    return this.executeQuery<FindOneResolverArgs<Filter>, T>(
      'findOne',
      args,
      options,
    );
  }

  @LogExecutionTime()
  async findMany<
    T extends ObjectRecord,
    Filter extends ObjectRecordFilter,
    OrderBy extends ObjectRecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<T, IEdge<T>>> {
    return this.executeQuery<
      FindManyResolverArgs<Filter, OrderBy>,
      IConnection<T, IEdge<T>>
    >('findMany', args, options);
  }

  @LogExecutionTime()
  async findDuplicates<T extends ObjectRecord>(
    args: FindDuplicatesResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<T>[]> {
    return this.executeQuery<
      FindDuplicatesResolverArgs<Partial<T>>,
      IConnection<T>[]
    >('findDuplicates', args, options);
  }

  @LogExecutionTime()
  async search<T extends ObjectRecord = ObjectRecord>(
    args: SearchResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<T>> {
    return this.executeQuery<SearchResolverArgs, IConnection<T>>(
      'search',
      args,
      options,
    );
  }

  /** MUTATIONS */

  @LogExecutionTime()
  async createOne<T extends ObjectRecord>(
    args: CreateOneResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T> {
    const results = await this.executeQuery<
      CreateManyResolverArgs<Partial<T>>,
      T[]
    >('createMany', { data: [args.data], upsert: args.upsert }, options);

    return results[0];
  }

  @LogExecutionTime()
  async createMany<T extends ObjectRecord>(
    args: CreateManyResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T[]> {
    return this.executeQuery<CreateManyResolverArgs<Partial<T>>, T[]>(
      'createMany',
      args,
      options,
    );
  }

  @LogExecutionTime()
  public async updateOne<T extends ObjectRecord>(
    args: UpdateOneResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T> {
    return await this.executeQuery<UpdateOneResolverArgs<Partial<T>>, T>(
      'updateOne',
      args,
      options,
    );
  }

  @LogExecutionTime()
  public async updateMany<T extends ObjectRecord>(
    args: UpdateManyResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T[]> {
    return this.executeQuery<UpdateManyResolverArgs<Partial<T>>, T[]>(
      'updateMany',
      args,
      options,
    );
  }

  @LogExecutionTime()
  public async deleteOne<T extends ObjectRecord & { deletedAt?: Date }>(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T> {
    return this.executeQuery<UpdateOneResolverArgs<Partial<T>>, T>(
      'deleteOne',
      {
        id: args.id,
        data: { deletedAt: new Date() } as Partial<T>,
      },
      options,
    );
  }

  @LogExecutionTime()
  public async deleteMany<T extends ObjectRecord & { deletedAt?: Date }>(
    args: DeleteManyResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T[]> {
    return this.executeQuery<UpdateManyResolverArgs<Partial<T>>, T[]>(
      'deleteMany',
      {
        filter: args.filter,

        data: { deletedAt: new Date() } as Partial<T>,
      },
      options,
    );
  }

  @LogExecutionTime()
  async destroyOne<T extends ObjectRecord>(
    args: DestroyOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T> {
    return this.executeQuery<DestroyOneResolverArgs, T>(
      'destroyOne',
      args,
      options,
    );
  }

  @LogExecutionTime()
  async destroyMany<T extends ObjectRecord>(
    args: DestroyManyResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T[]> {
    return this.executeQuery<DestroyManyResolverArgs, T[]>(
      'destroyMany',
      args,
      options,
    );
  }

  @LogExecutionTime()
  public async restoreMany<T extends ObjectRecord>(
    args: RestoreManyResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<T> {
    return this.executeQuery<UpdateManyResolverArgs<Partial<T>>, T>(
      'restoreMany',
      {
        filter: args.filter,
        data: { deletedAt: null } as Partial<T>,
      },
      options,
    );
  }

  private async executeQuery<Input extends ResolverArgs, Response>(
    operationName: WorkspaceResolverBuilderMethodNames,
    args: Input,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Response> {
    const { authContext, objectMetadataItemWithFieldMaps } = options;

    const resolver =
      this.graphqlQueryResolverFactory.getResolver(operationName);

    await resolver.validate(args, options);

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        operationName,
        args,
      );

    const computedArgs = await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType[capitalize(operationName)],
    );

    const results = await resolver.resolve(computedArgs as Input, options);

    const resultWithGetters = await this.queryResultGettersFactory.create(
      results,
      objectMetadataItemWithFieldMaps,
      authContext.workspace.id,
      options.objectMetadataMaps,
    );

    const resultWithGettersArray = Array.isArray(resultWithGetters)
      ? resultWithGetters
      : [resultWithGetters];

    await this.workspaceQueryHookService.executePostQueryHooks(
      authContext,
      objectMetadataItemWithFieldMaps.nameSingular,
      operationName,
      resultWithGettersArray,
    );

    return resultWithGetters;
  }
}
