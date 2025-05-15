import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, ModuleRef, createContextId } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { Module } from '@nestjs/core/injector/module';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import {
  WorkspacePostQueryHookInstance,
  WorkspacePreQueryHookInstance,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { isQueryResultFieldValueAConnection } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-connection.guard';
import { isQueryResultFieldValueANestedRecordArray } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-nested-record-array.guard';
import { isQueryResultFieldValueARecordArray } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-record-array.guard';
import { isQueryResultFieldValueARecord } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-record.guard';
import { WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookMetadataAccessor } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook-metadata.accessor';

@Injectable()
export class WorkspaceQueryHookExplorer implements OnModuleInit {
  private readonly logger = new Logger('WorkspaceQueryHookModule');
  private readonly injector = new Injector();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: WorkspaceQueryHookMetadataAccessor,
    private readonly workspaceQueryHookStorage: WorkspaceQueryHookStorage,
  ) {}

  onModuleInit() {
    this.explore();
  }

  async explore() {
    const hooks = this.discoveryService
      .getProviders()
      .filter((wrapper) =>
        this.metadataAccessor.isWorkspaceQueryHook(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    for (const hook of hooks) {
      const { instance, metatype } = hook;

      const { key, type } =
        this.metadataAccessor.getWorkspaceQueryHookMetadata(
          instance.constructor || metatype,
        ) ?? {};

      if (!key || !type) {
        this.logger.error(
          `PreHook ${hook.name} is missing key or type metadata`,
        );
        continue;
      }

      if (!hook.host) {
        this.logger.error(`PreHook ${hook.name} is missing host metadata`);

        continue;
      }

      this.registerWorkspaceQueryHook(
        key,
        type,
        instance,
        hook.host,
        !hook.isDependencyTreeStatic(),
      );
    }
  }

  async handlePreHook(
    executeParams: Parameters<WorkspacePreQueryHookInstance['execute']>,
    instance: object,
    host: Module,
    isRequestScoped: boolean,
  ): Promise<ReturnType<WorkspacePreQueryHookInstance['execute']>> {
    const methodName = 'execute';

    if (isRequestScoped) {
      const contextId = createContextId();

      if (this.moduleRef.registerRequestByContextId) {
        this.moduleRef.registerRequestByContextId(
          {
            req: {
              workspaceId: executeParams?.[0].workspace.id,
            },
          },
          contextId,
        );
      }

      const contextInstance = await this.injector.loadPerContext(
        instance,
        host,
        host.providers,
        contextId,
      );

      // @ts-expect-error legacy noImplicitAny
      return contextInstance[methodName].call(
        contextInstance,
        ...executeParams,
      );
    } else {
      // @ts-expect-error legacy noImplicitAny
      return instance[methodName].call(instance, ...executeParams);
    }
  }

  private transformPayload(payload: QueryResultFieldValue): ObjectRecord[] {
    if (isQueryResultFieldValueAConnection(payload)) {
      return payload.edges.map((edge) => edge.node);
    }

    if (isQueryResultFieldValueANestedRecordArray(payload)) {
      return payload.records;
    }

    if (isQueryResultFieldValueARecordArray(payload)) {
      return payload;
    }

    if (isQueryResultFieldValueARecord(payload)) {
      return [payload];
    }

    throw new GraphqlQueryRunnerException(
      `Unsupported payload type: ${payload}`,
      GraphqlQueryRunnerExceptionCode.INVALID_POST_HOOK_PAYLOAD,
    );
  }

  async handlePostHook(
    executeParams: Parameters<WorkspacePostQueryHookInstance['execute']>,
    instance: object,
    host: Module,
    isRequestScoped: boolean,
  ): Promise<ReturnType<WorkspacePostQueryHookInstance['execute']>> {
    const methodName = 'execute';

    const transformedPayload = this.transformPayload(executeParams[2]);

    if (isRequestScoped) {
      const contextId = createContextId();

      if (this.moduleRef.registerRequestByContextId) {
        this.moduleRef.registerRequestByContextId(
          {
            req: {
              workspaceId: executeParams?.[0].workspace.id,
            },
          },
          contextId,
        );
      }

      const contextInstance = await this.injector.loadPerContext(
        instance,
        host,
        host.providers,
        contextId,
      );

      // @ts-expect-error legacy noImplicitAny
      return contextInstance[methodName].call(
        contextInstance,
        executeParams[0],
        executeParams[1],
        transformedPayload,
      );
    } else {
      // @ts-expect-error legacy noImplicitAny
      return instance[methodName].call(
        instance,
        executeParams[0],
        executeParams[1],
        transformedPayload,
      );
    }
  }

  private registerWorkspaceQueryHook(
    key: WorkspaceQueryHookKey,
    type: WorkspaceQueryHookType,
    instance: object,
    host: Module,
    isRequestScoped: boolean,
  ) {
    switch (type) {
      case WorkspaceQueryHookType.PreHook:
        this.workspaceQueryHookStorage.registerWorkspaceQueryPreHookInstance(
          key,
          {
            instance: instance as WorkspacePreQueryHookInstance,
            host,
            isRequestScoped,
          },
        );
        break;
      case WorkspaceQueryHookType.PostHook:
        this.workspaceQueryHookStorage.registerWorkspacePostQueryHookInstance(
          key,
          {
            instance: instance as WorkspacePostQueryHookInstance,
            host,
            isRequestScoped,
          },
        );
        break;
      default:
        this.logger.error(`Unknown WorkspaceQueryHookType: ${type}`);
        break;
    }
  }
}
