/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookOptions } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';

@Injectable()
export class WorkspaceQueryHookMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isWorkspaceQueryHook(target: Type | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(WORKSPACE_QUERY_HOOK_METADATA, target);
  }

  getWorkspaceQueryHookMetadata(
    target: Type | Function,
  ): WorkspaceQueryHookOptions | undefined {
    return this.reflector.get(WORKSPACE_QUERY_HOOK_METADATA, target);
  }
}
