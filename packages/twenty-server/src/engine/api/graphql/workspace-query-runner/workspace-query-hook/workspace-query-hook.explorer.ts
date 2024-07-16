import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, ModuleRef, createContextId } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { Injector } from '@nestjs/core/injector/injector';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHookMetadataAccessor } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook-metadata.accessor';
import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';

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

  async handleHook(
    payload: Parameters<WorkspaceQueryHookInstance['execute']>,
    instance: object,
    host: Module,
    isRequestScoped: boolean,
  ) {
    const methodName = 'execute';

    if (isRequestScoped) {
      const contextId = createContextId();

      if (this.moduleRef.registerRequestByContextId) {
        this.moduleRef.registerRequestByContextId(
          {
            req: {
              workspaceId: payload?.[1],
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

      await contextInstance[methodName].call(contextInstance, ...payload);
    } else {
      await instance[methodName].call(instance, ...payload);
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
            instance: instance as WorkspaceQueryHookInstance,
            host,
            isRequestScoped,
          },
        );
        break;
      case WorkspaceQueryHookType.PostHook:
        this.workspaceQueryHookStorage.registerWorkspaceQueryPostHookInstance(
          key,
          {
            instance: instance as WorkspaceQueryHookInstance,
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
