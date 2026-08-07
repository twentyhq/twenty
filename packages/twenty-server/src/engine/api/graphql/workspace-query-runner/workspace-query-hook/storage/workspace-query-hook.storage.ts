// hook-registry.service.ts
import { Injectable } from '@nestjs/common';
import { type Module } from '@nestjs/core/injector/module';

import { isNonEmptyString } from '@sniptt/guards';

import {
  type WorkspacePostQueryHookInstance,
  type WorkspacePreQueryHookInstance,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { type WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';

interface WorkspaceQueryHookData<T> {
  instance: T;
  host: Module;
  isRequestScoped: boolean;
}

@Injectable()
export class WorkspaceQueryHookStorage {
  private preHookInstances = new Map<
    WorkspaceQueryHookKey,
    WorkspaceQueryHookData<WorkspacePreQueryHookInstance>[]
  >();
  private postHookInstances = new Map<
    WorkspaceQueryHookKey,
    WorkspaceQueryHookData<WorkspacePostQueryHookInstance>[]
  >();

  registerWorkspaceQueryPreHookInstance(
    key: WorkspaceQueryHookKey,
    data: WorkspaceQueryHookData<WorkspacePreQueryHookInstance>,
  ) {
    if (!this.preHookInstances.has(key)) {
      this.preHookInstances.set(key, []);
    }

    this.preHookInstances.get(key)?.push(data);
  }

  getWorkspaceQueryPreHookInstances(
    key: WorkspaceQueryHookKey,
  ): WorkspaceQueryHookData<WorkspacePreQueryHookInstance>[] {
    return this.getInstancesMatchingKey({
      instances: this.preHookInstances,
      key,
    });
  }

  registerWorkspacePostQueryHookInstance(
    key: WorkspaceQueryHookKey,
    data: WorkspaceQueryHookData<WorkspacePostQueryHookInstance>,
  ) {
    if (!this.postHookInstances.has(key)) {
      this.postHookInstances.set(key, []);
    }

    this.postHookInstances.get(key)?.push(data);
  }

  getWorkspacePostQueryHookInstances(
    key: WorkspaceQueryHookKey,
  ): WorkspaceQueryHookData<WorkspacePostQueryHookInstance>[] {
    return this.getInstancesMatchingKey({
      instances: this.postHookInstances,
      key,
    });
  }

  private getInstancesMatchingKey<T>({
    instances,
    key,
  }: {
    instances: ReadonlyMap<string, WorkspaceQueryHookData<T>[]>;
    key: WorkspaceQueryHookKey;
  }): WorkspaceQueryHookData<T>[] {
    const [objectName, methodName] = key.split('.');

    if (!isNonEmptyString(objectName) || !isNonEmptyString(methodName)) {
      throw new Error(`Can't split workspace query hook key: ${key}`);
    }

    return [
      ...(instances.get(`*.${methodName}`) ?? []),
      ...(instances.get(`${objectName}.*`) ?? []),
      ...(instances.get(key) ?? []),
    ];
  }
}
