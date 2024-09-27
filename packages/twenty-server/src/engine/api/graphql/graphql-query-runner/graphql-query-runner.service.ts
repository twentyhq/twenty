import { Injectable } from '@nestjs/common';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DestroyOneResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  ResolverArgs,
  ResolverArgsType,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
  WorkspaceResolverBuilderMethodNames,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { GraphqlQueryUpdateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-many-resolver.service';
import { GraphqlQueryUpdateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-one-resolver.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
  CallWebhookJobsJobOperation,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { capitalize } from 'src/utils/capitalize';

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
  async findOne<ObjectRecord extends IRecord, Filter extends RecordFilter>(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord> {
    return this.executeQuery<FindOneResolverArgs<Filter>, ObjectRecord>(
      new GraphqlQueryFindOneResolverService(this.twentyORMGlobalManager),
      'findOne',
      args,
      options,
    );
  }

  @LogExecutionTime()
  async findMany<
    ObjectRecord extends IRecord,
    Filter extends RecordFilter,
    OrderBy extends RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<ObjectRecord, IEdge<ObjectRecord>>> {
    return this.executeQuery<
      FindManyResolverArgs<Filter, OrderBy>,
      IConnection<ObjectRecord, IEdge<ObjectRecord>>
    >(
      new GraphqlQueryFindManyResolverService(this.twentyORMGlobalManager),
      'findMany',
      args,
      options,
    );
  }

  @LogExecutionTime()
  async createOne<ObjectRecord extends IRecord>(
    args: CreateOneResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord> {
    const results = await this.executeQuery<
      CreateManyResolverArgs<Partial<ObjectRecord>>,
      ObjectRecord[]
    >(
      new GraphqlQueryCreateManyResolverService(this.twentyORMGlobalManager),
      'createMany',
      { data: [args.data], upsert: args.upsert },
      options,
    );

    // TODO: trigger webhooks should be a consequence of the emitCreateEvents
    // TODO: emitCreateEvents should be moved to the ORM layer
    if (results) {
      await this.triggerWebhooks(
        results,
        CallWebhookJobsJobOperation.create,
        options,
      );
      this.emitCreateEvents(
        results,
        options.authContext,
        options.objectMetadataItem,
      );
    }

    return results[0];
  }

  @LogExecutionTime()
  async createMany<ObjectRecord extends IRecord>(
    args: CreateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord[]> {
    const results = await this.executeQuery<
      CreateManyResolverArgs<Partial<ObjectRecord>>,
      ObjectRecord[]
    >(
      new GraphqlQueryCreateManyResolverService(this.twentyORMGlobalManager),
      'createMany',
      args,
      options,
    );

    // TODO: trigger webhooks should be a consequence of the emitCreateEvents
    // TODO: emitCreateEvents should be moved to the ORM layer
    if (results) {
      await this.triggerWebhooks(
        results,
        CallWebhookJobsJobOperation.create,
        options,
      );
      this.emitCreateEvents(
        results,
        options.authContext,
        options.objectMetadataItem,
      );
    }

    return results;
  }

  @LogExecutionTime()
  async destroyOne<ObjectRecord extends IRecord>(
    args: DestroyOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord> {
    const result = await this.executeQuery<
      DestroyOneResolverArgs,
      ObjectRecord
    >(
      new GraphqlQueryDestroyOneResolverService(this.twentyORMGlobalManager),
      'destroyOne',
      args,
      options,
    );

    await this.triggerWebhooks(
      [result],
      CallWebhookJobsJobOperation.destroy,
      options,
    );

    this.emitDestroyEvents(
      [result],
      options.authContext,
      options.objectMetadataItem,
    );

    return result;
  }

  public async updateOne<ObjectRecord extends IRecord>(
    args: UpdateOneResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord> {
    const result = await this.executeQuery<
      UpdateOneResolverArgs<Partial<ObjectRecord>>,
      ObjectRecord
    >(
      new GraphqlQueryUpdateOneResolverService(this.twentyORMGlobalManager),
      'updateOne',
      args,
      options,
    );

    return result;
  }

  public async updateMany<ObjectRecord extends IRecord>(
    args: UpdateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord[]> {
    const result = await this.executeQuery<
      UpdateManyResolverArgs<Partial<ObjectRecord>>,
      ObjectRecord[]
    >(
      new GraphqlQueryUpdateManyResolverService(this.twentyORMGlobalManager),
      'updateMany',
      args,
      options,
    );

    return result;
  }

  private async executeQuery<Input extends ResolverArgs, Response>(
    resolver: ResolverService<Input, Response>,
    operationName: WorkspaceResolverBuilderMethodNames,
    args: Input,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Response> {
    const { authContext, objectMetadataItem } = options;

    resolver.validate(args, options);

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        operationName,
        args,
      );

    const computedArgs = await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType[capitalize(operationName)],
    );

    const results = await resolver.resolve(computedArgs as Input, options);

    await this.workspaceQueryHookService.executePostQueryHooks(
      authContext,
      objectMetadataItem.nameSingular,
      operationName,
      Array.isArray(results) ? results : [results],
    );

    return results;
  }

  private emitCreateEvents<T extends IRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ): void {
    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.created`,
      records.map((record) => ({
        userId: authContext.user?.id,
        recordId: record.id,
        objectMetadata: objectMetadataItem,
        properties: {
          before: null,
          after: this.removeGraphQLProperties(record),
        },
      })),
      authContext.workspace.id,
    );
  }

  private emitDestroyEvents<T extends IRecord>(
    records: T[],
    authContext: AuthContext,
    objectMetadataItem: ObjectMetadataInterface,
  ): void {
    this.workspaceEventEmitter.emit(
      `${objectMetadataItem.nameSingular}.destroyed`,
      records.map((record) => {
        return {
          userId: authContext.user?.id,
          recordId: record.id,
          objectMetadata: objectMetadataItem,
          properties: {
            before: this.removeGraphQLProperties(record),
            after: null,
          },
        };
      }),
      authContext.workspace.id,
    );
  }

  private removeGraphQLProperties<ObjectRecord extends IRecord>(
    record: ObjectRecord,
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

  private async triggerWebhooks<T>(
    jobsData: T[] | undefined,
    operation: CallWebhookJobsJobOperation,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    if (!jobsData || !Array.isArray(jobsData)) return;

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
}
