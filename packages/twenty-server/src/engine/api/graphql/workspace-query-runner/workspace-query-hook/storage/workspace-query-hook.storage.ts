// hook-registry.service.ts
import { Injectable } from '@nestjs/common';
import { Module } from '@nestjs/core/injector/module';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';

interface WorkspaceQueryHookData<T> {
  instance: T;
  host: Module;
  isRequestScoped: boolean;
}

@Injectable()
export class WorkspaceQueryHookStorage {
  private preHookInstances = new Map<
    WorkspaceQueryHookKey,
    WorkspaceQueryHookData<WorkspaceQueryHookInstance>[]
  >();
  private postHookInstances = new Map<
    WorkspaceQueryHookKey,
    WorkspaceQueryHookData<WorkspaceQueryHookInstance>[]
  >();

  registerWorkspaceQueryPreHookInstance(
    key: WorkspaceQueryHookKey,
    data: WorkspaceQueryHookData<WorkspaceQueryHookInstance>,
  ) {
    if (!this.preHookInstances.has(key)) {
      this.preHookInstances.set(key, []);
    }

    this.preHookInstances.get(key)?.push(data);
  }

  getWorkspaceQueryPreHookInstances(
    key: WorkspaceQueryHookKey,
  ): WorkspaceQueryHookData<WorkspaceQueryHookInstance>[] | undefined {
    return this.preHookInstances.get(key);
  }

  registerWorkspaceQueryPostHookInstance(
    key: WorkspaceQueryHookKey,
    data: WorkspaceQueryHookData<WorkspaceQueryHookInstance>,
  ) {
    if (!this.postHookInstances.has(key)) {
      this.postHookInstances.set(key, []);
    }

    this.postHookInstances.get(key)?.push(data);
  }

  getWorkspaceQueryPostHookInstances(
    key: WorkspaceQueryHookKey,
  ): WorkspaceQueryHookData<WorkspaceQueryHookInstance>[] | undefined {
    return this.postHookInstances.get(key);
  }
}
