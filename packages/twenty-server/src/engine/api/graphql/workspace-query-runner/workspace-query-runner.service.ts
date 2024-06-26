import {
  BadRequestException,
  Injectable,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import isEmpty from 'lodash.isempty';

import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DeleteManyResolverArgs,
  DeleteOneResolverArgs,
  FindDuplicatesResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  ResolverArgsType,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceQueryBuilderFactory } from 'src/engine/api/graphql/workspace-query-builder/workspace-query-builder.factory';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
  CallWebhookJobsJobOperation,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { parseResult } from 'src/engine/api/graphql/workspace-query-runner/utils/parse-result.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { NotFoundError } from 'src/engine/utils/graphql-errors.util';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters.factory';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { isQueryTimeoutError } from 'src/engine/utils/query-timeout.util';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { DuplicateService } from 'src/engine/core-modules/duplicate/duplicate.service';

import { WorkspaceQueryRunnerOptions } from './interfaces/query-runner-option.interface';
import {
  PGGraphQLMutation,
  PGGraphQLResult,
} from './interfaces/pg-graphql.interface';
import {
  PgGraphQLConfig,
  computePgGraphQLError,
} from './utils/compute-pg-graphql-error.util';

@Injectable()
export class WorkspaceQueryRunnerService {
  private readonly logger = new Logger(WorkspaceQueryRunnerService.name);

  constructor(
    private readonly workspaceQueryBuilderFactory: WorkspaceQueryBuilderFactory,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly queryRunnerArgsFactory: QueryRunnerArgsFactory,
    private readonly queryResultGettersFactory: QueryResultGettersFactory,
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly workspaceQueryHookService: WorkspaceQueryHookService,
    private readonly environmentService: EnvironmentService,
    private readonly duplicateService: DuplicateService,
  ) {}

  async findMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<Record> | undefined> {
    const { workspaceId, userId, objectMetadataItem } = options;
    const start = performance.now();

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      args,
      options,
      ResolverArgsType.FindMany,
    )) as FindManyResolverArgs<Filter, OrderBy>;

    const query = await this.workspaceQueryBuilderFactory.findMany(
      computedArgs,
      options,
    );

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'findMany',
      args,
    );

    const result = await this.execute(query, workspaceId);
    const end = performance.now();

    this.logger.log(
      `query time: ${end - start} ms on query ${
        options.objectMetadataItem.nameSingular
      }`,
    );

    return this.parseResult<IConnection<Record>>(
      result,
      objectMetadataItem,
      '',
    );
  }

  async findOne<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new BadRequestException('Missing filter argument');
    }
    const { workspaceId, userId, objectMetadataItem } = options;

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      args,
      options,
      ResolverArgsType.FindOne,
    )) as FindOneResolverArgs<Filter>;

    const query = await this.workspaceQueryBuilderFactory.findOne(
      computedArgs,
      options,
    );

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'findOne',
      args,
    );

    const result = await this.execute(query, workspaceId);
    const parsedResult = await this.parseResult<IConnection<Record>>(
      result,
      objectMetadataItem,
      '',
    );

    return parsedResult?.edges?.[0]?.node;
  }

  async findDuplicates<TRecord extends IRecord = IRecord>(
    args: FindDuplicatesResolverArgs<Partial<TRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<TRecord> | undefined> {
    if (!args.data && !args.ids) {
      throw new BadRequestException(
        'You have to provide either "data" or "id" argument',
      );
    }

    if (!args.ids && isEmpty(args.data)) {
      throw new BadRequestException(
        'The "data" condition can not be empty when ID input not provided',
      );
    }

    const { workspaceId, userId, objectMetadataItem } = options;

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      args,
      options,
      ResolverArgsType.FindDuplicates,
    )) as FindDuplicatesResolverArgs<TRecord>;

    let existingRecords: IRecord[] | undefined = undefined;

    if (computedArgs.ids && computedArgs.ids.length > 0) {
      existingRecords = await this.duplicateService.findExistingRecords(
        computedArgs.ids,
        objectMetadataItem,
        workspaceId,
      );

      if (!existingRecords || existingRecords.length === 0) {
        throw new NotFoundError(`Object with id ${args.ids} not found`);
      }
    }

    const query = await this.workspaceQueryBuilderFactory.findDuplicates(
      computedArgs,
      options,
      existingRecords,
    );

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'findDuplicates',
      computedArgs,
    );

    const result = await this.execute(query, workspaceId);

    return this.parseResult<IConnection<TRecord>>(
      result,
      objectMetadataItem,
      '',
      true,
    );
  }

  async createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<Record>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { workspaceId, userId, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);

    if (args.upsert) {
      return await this.upsertMany(args, options);
    }

    args.data.forEach((record) => {
      if (record?.id) {
        assertIsValidUuid(record.id);
      }
    });

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      args,
      options,
      ResolverArgsType.CreateMany,
    )) as CreateManyResolverArgs<Record>;

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'createMany',
      args,
    );

    const query = await this.workspaceQueryBuilderFactory.createMany(
      computedArgs,
      options,
    );

    const result = await this.execute(query, workspaceId);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'insertInto',
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.create,
      options,
    );

    parsedResults.forEach((record) => {
      this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.created`, {
        name: `${objectMetadataItem.nameSingular}.created`,
        workspaceId,
        userId,
        recordId: record.id,
        objectMetadata: objectMetadataItem,
        properties: {
          after: record,
        },
      } satisfies ObjectRecordCreateEvent<any>);
    });

    return parsedResults;
  }

  async upsertMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<Record>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const ids = args.data
      .map((item) => item.id)
      .filter((id) => id !== undefined);

    const existingRecords =
      ids.length > 0
        ? await this.duplicateService.findExistingRecords(
            ids as string[],
            options.objectMetadataItem,
            options.workspaceId,
          )
        : [];

    const existingRecordsMap = new Map(
      existingRecords.map((record) => [record.id, record]),
    );

    const results: Record[] = [];
    const recordsToCreate: Partial<Record>[] = [];

    for (const payload of args.data) {
      if (payload.id && existingRecordsMap.has(payload.id)) {
        const result = await this.updateOne(
          { id: payload.id, data: payload },
          options,
        );

        if (result) {
          results.push(result);
        }
      } else {
        recordsToCreate.push(payload);
      }
    }

    if (recordsToCreate.length > 0) {
      const createResults = await this.createMany(
        { data: recordsToCreate } as CreateManyResolverArgs<Partial<Record>>,
        options,
      );

      if (createResults) {
        results.push(...createResults);
      }
    }

    return results;
  }

  async createOne<Record extends IRecord = IRecord>(
    args: CreateOneResolverArgs<Partial<Record>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const results = await this.createMany(
      { data: [args.data], upsert: args.upsert },
      options,
    );

    return results?.[0];
  }

  async updateOne<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Partial<Record>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const { workspaceId, userId, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);
    assertIsValidUuid(args.id);

    const existingRecord = await this.findOne(
      { filter: { id: { eq: args.id } } } as FindOneResolverArgs,
      options,
    );

    const query = await this.workspaceQueryBuilderFactory.updateOne(
      args,
      options,
    );

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'updateOne',
      args,
    );

    const result = await this.execute(query, workspaceId);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'update',
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.update,
      options,
    );

    this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.updated`, {
      name: `${objectMetadataItem.nameSingular}.updated`,
      workspaceId,
      userId,
      recordId: (existingRecord as Record).id,
      objectMetadata: objectMetadataItem,
      properties: {
        before: this.removeNestedProperties(existingRecord as Record),
        after: this.removeNestedProperties(parsedResults?.[0]),
      },
    } satisfies ObjectRecordUpdateEvent<any>);

    return parsedResults?.[0];
  }

  async updateMany<Record extends IRecord = IRecord>(
    args: UpdateManyResolverArgs<Partial<Record>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { userId, workspaceId, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);
    args.filter?.id?.in?.forEach((id) => assertIsValidUuid(id));

    const maximumRecordAffected = this.environmentService.get(
      'MUTATION_MAXIMUM_RECORD_AFFECTED',
    );
    const query = await this.workspaceQueryBuilderFactory.updateMany(args, {
      ...options,
      atMost: maximumRecordAffected,
    });

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'updateMany',
      args,
    );

    const result = await this.execute(query, workspaceId);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'update',
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.update,
      options,
    );

    // TODO: check - NO EVENT SENT?
    // OK I spent 2 hours trying to implement before/after diff and
    // figured out why it hasn't been implement
    // Doing a findMany in that context is very hard as long as we don't
    // have a proper ORM. Let's come back to this once we do (target end of April 24?)

    return parsedResults;
  }

  async deleteMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: DeleteManyResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { workspaceId, userId, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);

    const maximumRecordAffected = this.environmentService.get(
      'MUTATION_MAXIMUM_RECORD_AFFECTED',
    );
    const query = await this.workspaceQueryBuilderFactory.deleteMany(args, {
      ...options,
      atMost: maximumRecordAffected,
    });

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'deleteMany',
      args,
    );

    const result = await this.execute(query, workspaceId);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'deleteFrom',
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.delete,
      options,
    );

    parsedResults.forEach((record) => {
      this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.deleted`, {
        name: `${objectMetadataItem.nameSingular}.deleted`,
        workspaceId,
        userId,
        recordId: record.id,
        objectMetadata: objectMetadataItem,
        properties: {
          before: [this.removeNestedProperties(record)],
        },
      } satisfies ObjectRecordDeleteEvent<any>);
    });

    return parsedResults;
  }

  async deleteOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const { workspaceId, userId, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);
    assertIsValidUuid(args.id);

    const query = await this.workspaceQueryBuilderFactory.deleteOne(
      args,
      options,
    );

    // TODO START: remove this awful patch and use our upcoming custom ORM is developed
    const deletedWorkspaceMember = await this.handleDeleteWorkspaceMember(
      args.id,
      workspaceId,
      objectMetadataItem,
    );

    const deletedBlocklistItem = await this.handleDeleteBlocklistItem(
      args.id,
      workspaceId,
      objectMetadataItem,
    );
    // TODO END

    await this.workspaceQueryHookService.executePreQueryHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'deleteOne',
      args,
    );

    const result = await this.execute(query, workspaceId);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'deleteFrom',
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.delete,
      options,
    );

    this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.deleted`, {
      name: `${objectMetadataItem.nameSingular}.deleted`,
      workspaceId,
      userId,
      recordId: args.id,
      objectMetadata: objectMetadataItem,
      properties: {
        before: {
          ...(deletedWorkspaceMember ?? {}),
          ...(deletedBlocklistItem ?? {}),
          ...this.removeNestedProperties(parsedResults?.[0]),
        },
      },
    } satisfies ObjectRecordDeleteEvent<any>);

    return parsedResults?.[0];
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

      sanitizedRecord[key] = value;
    }

    return sanitizedRecord;
  }

  async execute(
    query: string,
    workspaceId: string,
  ): Promise<PGGraphQLResult | undefined> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    try {
      return await workspaceDataSource?.transaction(
        async (transactionManager) => {
          await transactionManager.query(`
          SET search_path TO ${this.workspaceDataSourceService.getSchemaName(
            workspaceId,
          )};
        `);

          const results = transactionManager.query<PGGraphQLResult>(
            `SELECT graphql.resolve($1);`,
            [query],
          );

          return results;
        },
      );
    } catch (error) {
      if (isQueryTimeoutError(error)) {
        throw new RequestTimeoutException(error.message);
      }

      throw error;
    }
  }

  private async parseResult<Result>(
    graphqlResult: PGGraphQLResult | undefined,
    objectMetadataItem: ObjectMetadataInterface,
    command: string,
    isMultiQuery = false,
  ): Promise<Result> {
    const entityKey = `${command}${computeObjectTargetTable(
      objectMetadataItem,
    )}Collection`;
    const result = !isMultiQuery
      ? graphqlResult?.[0]?.resolve?.data?.[entityKey]
      : Object.keys(graphqlResult?.[0]?.resolve?.data).reduce(
          (acc: IRecord[], dataItem, index) => {
            acc.push(graphqlResult?.[0]?.resolve?.data[`${entityKey}${index}`]);

            return acc;
          },
          [],
        );
    const errors = graphqlResult?.[0]?.resolve?.errors;

    if (
      result &&
      ['update', 'deleteFrom'].includes(command) &&
      !result.affectedCount
    ) {
      throw new BadRequestException('No rows were affected.');
    }

    if (errors && errors.length > 0) {
      const error = computePgGraphQLError(
        command,
        objectMetadataItem.nameSingular,
        errors,
        {
          atMost: this.environmentService.get(
            'MUTATION_MAXIMUM_RECORD_AFFECTED',
          ),
        } satisfies PgGraphQLConfig,
      );

      throw error;
    }

    const resultWithGetters = await this.queryResultGettersFactory.create(
      result,
      objectMetadataItem,
    );

    return parseResult(resultWithGetters);
  }

  async executeAndParse<Result>(
    query: string,
    objectMetadataItem: ObjectMetadataInterface,
    command: string,
    workspaceId: string,
  ): Promise<Result> {
    const result = await this.execute(query, workspaceId);

    return this.parseResult(result, objectMetadataItem, command);
  }

  async triggerWebhooks<Record>(
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
          workspaceId: options.workspaceId,
          operation,
          objectMetadataItem: options.objectMetadataItem,
        },
        { retryLimit: 3 },
      );
    });
  }

  async handleDeleteWorkspaceMember(
    id: string,
    workspaceId: string,
    objectMetadataItem: ObjectMetadataInterface,
  ) {
    if (objectMetadataItem.nameSingular !== 'workspaceMember') {
      return;
    }

    const workspaceMemberResult = await this.executeAndParse<IRecord>(
      `
      query {
        workspaceMemberCollection(filter: {id: {eq: "${id}"}}) {
          edges {
            node {
              userId: userId
            }
          }
        }
      }
      `,
      objectMetadataItem,
      '',
      workspaceId,
    );

    return workspaceMemberResult.edges?.[0]?.node;
  }

  async handleDeleteBlocklistItem(
    id: string,
    workspaceId: string,
    objectMetadataItem: ObjectMetadataInterface,
  ) {
    if (objectMetadataItem.standardId !== STANDARD_OBJECT_IDS.blocklist) {
      return;
    }

    const blocklistItemResult = await this.executeAndParse<IRecord>(
      `
      query {
        blocklistCollection(filter: {id: {eq: "${id}"}}) {
          edges {
            node {
              handle
              workspaceMember {
                id
              }
            }
          }
        }
      }
      `,
      objectMetadataItem,
      '',
      workspaceId,
    );

    return blocklistItemResult.edges?.[0]?.node;
  }
}
