import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';

import {
  ExecutePreHookMethod,
  WorkspacePreQueryHookPayload,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/types/workspace-query-hook.type';
import { workspacePreQueryHooks } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.config';

@Injectable()
export class WorkspacePreQueryHookService {
  constructor(private readonly workspaceQueryHookModuleRef: ModuleRef) {}

  public async executePreHooks<T extends ExecutePreHookMethod>(
    userId: string | undefined,
    workspaceId: string,
    objectName: string,
    method: T,
    payload: WorkspacePreQueryHookPayload<T>,
  ): Promise<void> {
    const hooks = workspacePreQueryHooks[objectName] || [];

    for (const hookName of Object.values(hooks[method] ?? [])) {
      const hook: WorkspacePreQueryHook =
        await this.workspaceQueryHookModuleRef.get(hookName, {
          strict: false,
        });

      await hook.execute(userId, workspaceId, payload);
    }
  }
}
