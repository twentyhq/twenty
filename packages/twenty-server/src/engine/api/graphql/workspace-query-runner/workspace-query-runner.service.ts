import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import isEmpty from 'lodash.isempty';
import { DataSource } from 'typeorm';

import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
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
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
  CallWebhookJobsJobOperation,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { parseResult } from 'src/engine/api/graphql/workspace-query-runner/utils/parse-result.util';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { DuplicateService } from 'src/engine/core-modules/duplicate/duplicate.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isQueryTimeoutError } from 'src/engine/utils/query-timeout.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

import {
  PGGraphQLMutation,
  PGGraphQLResult,
} from './interfaces/pg-graphql.interface';
import { WorkspaceQueryRunnerOptions } from './interfaces/query-runner-option.interface';
import {
  PgGraphQLConfig,
  computePgGraphQLError,
} from './utils/compute-pg-graphql-error.util';

@Injectable()
export class WorkspaceQueryRunnerService {
  private readonly logger = new Logger(WorkspaceQueryRunnerService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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
    const { authContext, objectMetadataItem } = options;
    const start = performance.now();

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

    const query = await this.workspaceQueryBuilderFactory.findMany(
      computedArgs,
      options,
    );

    const result = await this.execute(query, authContext.workspace.id);
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
      authContext.workspace.id,
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
      throw new WorkspaceQueryRunnerException(
        'Missing filter argument',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
    const { authContext, objectMetadataItem } = options;

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

    const query = await this.workspaceQueryBuilderFactory.findOne(
      computedArgs,
      options,
    );

    const result = await this.execute(query, authContext.workspace.id);
    const parsedResult = await this.parseResult<IConnection<Record>>(
      result,
      objectMetadataItem,
      '',
      authContext.workspace.id,
    );

    return parsedResult?.edges?.[0]?.node;
  }

  async findDuplicates<TRecord extends IRecord = IRecord>(
    args: FindDuplicatesResolverArgs<Partial<TRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<TRecord> | undefined> {
    if (!args.data && !args.ids) {
      throw new WorkspaceQueryRunnerException(
        'You have to provide either "data" or "id" argument',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (!args.ids && isEmpty(args.data)) {
      throw new WorkspaceQueryRunnerException(
        'The "data" condition can not be empty when ID input not provided',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const { authContext, objectMetadataItem } = options;

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'findDuplicates',
        args,
      );

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType.FindDuplicates,
    )) as FindDuplicatesResolverArgs<TRecord>;

    let existingRecords: IRecord[] | undefined = undefined;

    if (computedArgs.ids && computedArgs.ids.length > 0) {
      existingRecords = await this.duplicateService.findExistingRecords(
        computedArgs.ids,
        objectMetadataItem,
        authContext.workspace.id,
      );

      if (!existingRecords || existingRecords.length === 0) {
        throw new WorkspaceQueryRunnerException(
          `Object with id ${args.ids} not found`,
          WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
        );
      }
    }

    const query = await this.workspaceQueryBuilderFactory.findDuplicates(
      computedArgs,
      options,
      existingRecords,
    );

    const result = await this.execute(query, authContext.workspace.id);

    return this.parseResult<IConnection<TRecord>>(
      result,
      objectMetadataItem,
      '',
      authContext.workspace.id,
      true,
    );
  }

  async createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<Record>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { authContext, objectMetadataItem } = options;

    assertMutationNotOnRemoteObject(objectMetadataItem);

    if (args.upsert) {
      return await this.upsertMany(args, options);
    }

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
    )) as CreateManyResolverArgs<Record>;

    const query = await this.workspaceQueryBuilderFactory.createMany(
      computedArgs,
      options,
    );

    const result = await this.execute(query, authContext.workspace.id);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'insertInto',
        authContext.workspace.id,
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
        workspaceId: authContext.workspace.id,
        userId: authContext.user?.id,
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
            options.authContext.workspace.id,
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
    const { authContext, objectMetadataItem } = options;
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    assertMutationNotOnRemoteObject(objectMetadataItem);
    assertIsValidUuid(args.id);

    const existingRecord = await repository.findOne({
      where: { id: args.id },
    });

    if (!existingRecord) {
      throw new WorkspaceQueryRunnerException(
        `Object with id ${args.id} not found`,
        WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND,
      );
    }

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'updateOne',
        args,
      );

    const query = await this.workspaceQueryBuilderFactory.updateOne(
      hookedArgs,
      options,
    );

    const result = await this.execute(query, authContext.workspace.id);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'update',
        authContext.workspace.id,
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.update,
      options,
    );

    this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.updated`, {
      name: `${objectMetadataItem.nameSingular}.updated`,
      workspaceId: authContext.workspace.id,
      userId: authContext.user?.id,
      recordId: existingRecord.id,
      objectMetadata: objectMetadataItem,
      properties: {
        updatedFields: Object.keys(args.data),
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
    const { authContext, objectMetadataItem } = options;
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    assertMutationNotOnRemoteObject(objectMetadataItem);
    args.filter?.id?.in?.forEach((id) => assertIsValidUuid(id));

    const existingRecords = await repository.find({
      where: { id: { in: args.filter?.id?.in } },
    });
    const mappedRecords = new Map(
      existingRecords.map((record) => [record.id, record]),
    );
    const maximumRecordAffected = this.environmentService.get(
      'MUTATION_MAXIMUM_AFFECTED_RECORDS',
    );

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'updateMany',
        args,
      );

    const query = await this.workspaceQueryBuilderFactory.updateMany(
      hookedArgs,
      {
        ...options,
        atMost: maximumRecordAffected,
      },
    );

    const result = await this.execute(query, authContext.workspace.id);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'update',
        authContext.workspace.id,
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.update,
      options,
    );

    parsedResults.forEach((record) => {
      const existingRecord = mappedRecords.get(record.id);

      if (!existingRecord) {
        this.logger.warn(
          `Record with id ${record.id} not found in the database`,
        );

        return;
      }

      this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.updated`, {
        name: `${objectMetadataItem.nameSingular}.updated`,
        workspaceId: authContext.workspace.id,
        userId: authContext.user?.id,
        recordId: existingRecord.id,
        objectMetadata: objectMetadataItem,
        properties: {
          updatedFields: Object.keys(args.data),
          before: this.removeNestedProperties(existingRecord as Record),
          after: this.removeNestedProperties(record),
        },
      } satisfies ObjectRecordUpdateEvent<any>);
    });

    return parsedResults;
  }

  async deleteMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: DeleteManyResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { authContext, objectMetadataItem } = options;
    let query: string;

    assertMutationNotOnRemoteObject(objectMetadataItem);

    const maximumRecordAffected = this.environmentService.get(
      'MUTATION_MAXIMUM_AFFECTED_RECORDS',
    );

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'deleteMany',
        args,
      );

    if (objectMetadataItem.softDelete) {
      query = await this.workspaceQueryBuilderFactory.updateMany(
        {
          filter: hookedArgs.filter,
          data: {
            deletedAt: new Date().toISOString(),
          },
        },
        {
          ...options,
          atMost: maximumRecordAffected,
        },
      );
    } else {
      query = await this.workspaceQueryBuilderFactory.deleteMany(hookedArgs, {
        ...options,
        atMost: maximumRecordAffected,
      });
    }

    const result = await this.execute(query, authContext.workspace.id);

    console.log('result', JSON.stringify(result, null, 2));

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        objectMetadataItem.softDelete ? 'update' : 'deleteFrom',
        authContext.workspace.id,
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
        workspaceId: authContext.workspace.id,
        userId: authContext.user?.id,
        recordId: record.id,
        objectMetadata: objectMetadataItem,
        properties: {
          before: this.removeNestedProperties(record),
        },
      } satisfies ObjectRecordDeleteEvent<any>);
    });

    return parsedResults;
  }

  async deleteOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const { authContext, objectMetadataItem } = options;
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );
    let query: string;

    assertMutationNotOnRemoteObject(objectMetadataItem);
    assertIsValidUuid(args.id);

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItem.nameSingular,
        'deleteOne',
        args,
      );

    if (objectMetadataItem.softDelete) {
      query = await this.workspaceQueryBuilderFactory.updateOne(
        {
          id: hookedArgs.id,
          data: {
            deletedAt: new Date().toISOString(),
          },
        },
        options,
      );
    } else {
      query = await this.workspaceQueryBuilderFactory.deleteOne(
        hookedArgs,
        options,
      );
    }

    const existingRecord = await repository.findOne({
      where: { id: args.id },
    });

    const result = await this.execute(query, authContext.workspace.id);

    const parsedResults = (
      await this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        objectMetadataItem.softDelete ? 'update' : 'deleteFrom',
        authContext.workspace.id,
      )
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.delete,
      options,
    );

    this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.deleted`, {
      name: `${objectMetadataItem.nameSingular}.deleted`,
      workspaceId: authContext.workspace.id,
      userId: authContext.user?.id,
      recordId: args.id,
      objectMetadata: objectMetadataItem,
      properties: {
        before: {
          ...(existingRecord ?? {}),
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

      if (key === '__typename') {
        continue;
      }

      sanitizedRecord[key] = value;
    }

    return sanitizedRecord;
  }

  async executeSQL(
    workspaceDataSource: DataSource,
    workspaceId: string,
    sqlQuery: string,
    parameters?: any[],
  ) {
    try {
      return await workspaceDataSource?.transaction(
        async (transactionManager) => {
          await transactionManager.query(`
          SET LOCAL search_path TO ${this.workspaceDataSourceService.getSchemaName(
            workspaceId,
          )};
        `);

          const results = transactionManager.query(sqlQuery, parameters);

          return results;
        },
      );
    } catch (error) {
      if (isQueryTimeoutError(error)) {
        throw new WorkspaceQueryRunnerException(
          'The SQL request took too long to process, resulting in a query read timeout. To resolve this issue, consider modifying your query by reducing the depth of relationships or limiting the number of records being fetched.',
          WorkspaceQueryRunnerExceptionCode.QUERY_TIMEOUT,
        );
      }

      throw error;
    }
  }

  async execute(
    query: string,
    workspaceId: string,
  ): Promise<PGGraphQLResult | undefined> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    return this.executeSQL(
      workspaceDataSource,
      workspaceId,
      `SELECT graphql.resolve($1);`,
      [query],
    );
  }

  private async parseResult<Result>(
    graphqlResult: PGGraphQLResult | undefined,
    objectMetadataItem: ObjectMetadataInterface,
    command: string,
    workspaceId: string,
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
      throw new WorkspaceQueryRunnerException(
        'No rows were affected.',
        WorkspaceQueryRunnerExceptionCode.NO_ROWS_AFFECTED,
      );
    }

    if (errors && errors.length > 0) {
      const error = computePgGraphQLError(
        command,
        objectMetadataItem.nameSingular,
        errors,
        {
          atMost: this.environmentService.get(
            'MUTATION_MAXIMUM_AFFECTED_RECORDS',
          ),
        } satisfies PgGraphQLConfig,
      );

      throw error;
    }

    const resultWithGetters = await this.queryResultGettersFactory.create(
      result,
      objectMetadataItem,
      workspaceId,
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

    return this.parseResult(result, objectMetadataItem, command, workspaceId);
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
          workspaceId: options.authContext.workspace.id,
          operation,
          objectMetadataItem: options.objectMetadataItem,
        },
        { retryLimit: 3 },
      );
    });
  }
}
