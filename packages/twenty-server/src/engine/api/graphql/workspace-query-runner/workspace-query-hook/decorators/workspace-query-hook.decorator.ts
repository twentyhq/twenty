import { type Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';

export type WorkspaceQueryHookKey =
  `${string}.${WorkspaceResolverBuilderMethodNames}`;

export interface WorkspaceQueryHookOptions {
  key: WorkspaceQueryHookKey;
  type?: WorkspaceQueryHookType;
  scope?: Scope;
}

export function WorkspaceQueryHook(
  keyOrOptions: WorkspaceQueryHookKey | WorkspaceQueryHookOptions,
): ClassDecorator {
  const options: WorkspaceQueryHookOptions =
    keyOrOptions && typeof keyOrOptions === 'object'
      ? keyOrOptions
      : { key: keyOrOptions };

  // Default to PreHook
  if (!options.type) {
    options.type = WorkspaceQueryHookType.PRE_HOOK;
  }

  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(WORKSPACE_QUERY_HOOK_METADATA, options)(target);
  };
}
