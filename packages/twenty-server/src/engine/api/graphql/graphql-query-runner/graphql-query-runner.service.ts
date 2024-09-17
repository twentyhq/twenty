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
  CreateOneResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  ResolverArgsType,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class GraphqlQueryRunnerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceQueryHookService: WorkspaceQueryHookService,
    private readonly queryRunnerArgsFactory: QueryRunnerArgsFactory,
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

    const { authContext, objectMetadataItem } = options;

    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new WorkspaceQueryRunnerException(
        'Missing filter argument',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'findOne',
        args,
      );

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType.FindOne,
    )) as FindOneResolverArgs<Filter>;

    return graphqlQueryFindOneResolverService.findOne(computedArgs, options);
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

    const { authContext, objectMetadataItem } = options;

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'findMany',
        args,
      );

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType.FindMany,
    )) as FindManyResolverArgs<Filter, OrderBy>;

    return graphqlQueryFindManyResolverService.findMany(computedArgs, options);
  }

  @LogExecutionTime()
  async createOne<ObjectRecord extends IRecord = IRecord>(
    args: CreateOneResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord | undefined> {
    const graphqlQueryCreateManyResolverService =
      new GraphqlQueryCreateManyResolverService(this.twentyORMGlobalManager);

    const { authContext, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);

    if (args.data.id) {
      assertIsValidUuid(args.data.id);
    }

    const createManyArgs = {
      data: [args.data],
      upsert: args.upsert,
    } as CreateManyResolverArgs<ObjectRecord>;

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'createMany',
        createManyArgs,
      );

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType.CreateMany,
    )) as CreateManyResolverArgs<ObjectRecord>;

    const results = await graphqlQueryCreateManyResolverService.createMany(
      computedArgs,
      options,
    );

    return results?.[0] as ObjectRecord;
  }

  @LogExecutionTime()
  async createMany<ObjectRecord extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord[] | undefined> {
    const graphqlQueryCreateManyResolverService =
      new GraphqlQueryCreateManyResolverService(this.twentyORMGlobalManager);

    const { authContext, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);

    args.data.forEach((record) => {
      if (record?.id) {
        assertIsValidUuid(record.id);
      }
    });

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'createMany',
        args,
      );

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType.CreateMany,
    )) as CreateManyResolverArgs<ObjectRecord>;

    const results = await graphqlQueryCreateManyResolverService.createMany(
      computedArgs,
      options,
    );

    return results as ObjectRecord[];
  }
}
