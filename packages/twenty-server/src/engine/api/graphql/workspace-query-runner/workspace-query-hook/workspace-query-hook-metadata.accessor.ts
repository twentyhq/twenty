import { Injectable, type Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type Constructor = new (...args: unknown[]) => unknown;

import { type WorkspaceQueryHookOptions } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';

@Injectable()
export class WorkspaceQueryHookMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isWorkspaceQueryHook(target: Type | Constructor): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(WORKSPACE_QUERY_HOOK_METADATA, target);
  }

  getWorkspaceQueryHookMetadata(
    target: Type | Constructor,
  ): WorkspaceQueryHookOptions | undefined {
    return this.reflector.get(WORKSPACE_QUERY_HOOK_METADATA, target);
  }
}
