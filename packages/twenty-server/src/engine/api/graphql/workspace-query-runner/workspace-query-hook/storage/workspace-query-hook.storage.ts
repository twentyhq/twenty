// hook-registry.service.ts
import { Injectable } from '@nestjs/common';
import { Module } from '@nestjs/core/injector/module';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

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
  ): WorkspaceQueryHookData<WorkspaceQueryHookInstance>[] {
    const methodName = key.split('.')?.[1] as
      | WorkspaceResolverBuilderMethodNames
      | undefined;
    let wildcardInstances: WorkspaceQueryHookData<WorkspaceQueryHookInstance>[] =
      [];

    if (!methodName) {
      throw new Error(`Can't split workspace query hook key: ${key}`);
    }

    // Retrive wildcard pre-hook instances
    if (this.preHookInstances.has(`*.${methodName}`)) {
      wildcardInstances = this.preHookInstances.get(`*.${methodName}`)!;
    }

    return [...wildcardInstances, ...(this.preHookInstances.get(key) ?? [])];
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
  ): WorkspaceQueryHookData<WorkspaceQueryHookInstance>[] {
    const methodName = key.split('.')?.[1] as
      | WorkspaceResolverBuilderMethodNames
      | undefined;
    let wildcardInstances: WorkspaceQueryHookData<WorkspaceQueryHookInstance>[] =
      [];

    if (!methodName) {
      throw new Error(`Can't split workspace query hook key: ${key}`);
    }

    // Retrive wildcard post-hook instances
    if (this.postHookInstances.has(`*.${methodName}`)) {
      wildcardInstances = this.postHookInstances.get(`*.${methodName}`)!;
    }

    return [...wildcardInstances, ...(this.postHookInstances.get(key) ?? [])];
  }
}
