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
  DestroyOneResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  ResolverArgsType,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
  CallWebhookJobsJobOperation,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class GraphqlQueryRunnerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceQueryHookService: WorkspaceQueryHookService,
    private readonly queryRunnerArgsFactory: QueryRunnerArgsFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
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

    const results = (await graphqlQueryCreateManyResolverService.createMany(
      computedArgs,
      options,
    )) as ObjectRecord[];

    await this.triggerWebhooks<ObjectRecord>(
      results,
      CallWebhookJobsJobOperation.create,
      options,
    );

    this.emitCreateEvents<ObjectRecord>(
      results,
      authContext,
      objectMetadataItem,
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

    const results = (await graphqlQueryCreateManyResolverService.createMany(
      computedArgs,
      options,
    )) as ObjectRecord[];

    await this.workspaceQueryHookService.executePostQueryHooks(
      authContext,
      objectMetadataItem.nameSingular,
      'createMany',
      results,
    );

    await this.triggerWebhooks<ObjectRecord>(
      results,
      CallWebhookJobsJobOperation.create,
      options,
    );

    this.emitCreateEvents<ObjectRecord>(
      results,
      authContext,
      objectMetadataItem,
    );

    return results;
  }

  private emitCreateEvents<BaseRecord extends IRecord = IRecord>(
    records: BaseRecord[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ) {
    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.created`,
      records.map(
        (record) =>
          ({
            userId: authContext.user?.id,
            recordId: record.id,
            objectMetadata: objectMetadataItem,
            properties: {
              after: record,
            },
          }) satisfies ObjectRecordCreateEvent<any>,
      ),
      authContext.workspace.id,
    );
  }

  private async triggerWebhooks<Record>(
    jobsData: Record[] | undefined,
    operation: CallWebhookJobsJobOperation,
    options: WorkspaceQueryRunnerOptions,
  ) {
    if (!Array.isArray(jobsData)) {
      return;
    }
    jobsData.forEach((jobData) => {
      this.messageQueueService.add<CallWebhookJobsJobData>(
        CallWebhookJobsJob.name,
        {
          record: jobData,
          workspaceId: options.authContext.workspace.id,
          operation,
          objectMetadataItem: options.objectMetadataItem,
        },
        { retryLimit: 3 },
      );
    });
  }

  @LogExecutionTime()
  async destroyOne<ObjectRecord extends IRecord = IRecord>(
    args: DestroyOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord | undefined> {
    const graphqlQueryDestroyOneResolverService =
      new GraphqlQueryDestroyOneResolverService(this.twentyORMGlobalManager);

    const { authContext, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);
    assertIsValidUuid(args.id);

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'destroyOne',
        args,
      );

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType.DestroyOne,
    )) as DestroyOneResolverArgs;

    const result = (await graphqlQueryDestroyOneResolverService.destroyOne(
      computedArgs,
      options,
    )) as ObjectRecord;

    await this.workspaceQueryHookService.executePostQueryHooks(
      authContext,
      objectMetadataItem.nameSingular,
      'destroyOne',
      [result],
    );

    await this.triggerWebhooks<IRecord>(
      [result],
      CallWebhookJobsJobOperation.destroy,
      options,
    );

    this.emitDestroyEvents<IRecord>([result], authContext, objectMetadataItem);

    return result;
  }

  private emitDestroyEvents<BaseRecord extends IRecord = IRecord>(
    records: BaseRecord[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ) {
    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.destroyed`,
      records.map((record) => {
        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before: this.removeNestedProperties(record),
          },
        } satisfies ObjectRecordDeleteEvent<any>;
      }),
      authContext.workspace.id,
    );
  }

  private removeNestedProperties<Record extends IRecord = IRecord>(
    record: Record,
  ) {
    if (!record) {
      return;
    }

    const sanitizedRecord = {};

    for (const [key, value] of Object.entries(record)) {
      if (value && typeof value === 'object' && value['edges']) {
        continue;
      }

      if (key === '__typename') {
        continue;
      }

      sanitizedRecord[key] = value;
    }

    return sanitizedRecord;
  }
}
