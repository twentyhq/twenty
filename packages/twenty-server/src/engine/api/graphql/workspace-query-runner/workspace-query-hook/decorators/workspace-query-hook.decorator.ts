import { Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WORKSPACE_QUERY_HOOK_METADATA } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.constants';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';

export type WorkspaceQueryHookKey =
  `${string}.${WorkspaceResolverBuilderMethodNames}`;

export interface WorkspaceQueryHookOptions {
  key: WorkspaceQueryHookKey;
  type?: WorkspaceQueryHookType;
  scope?: Scope;
}

export function WorkspaceQueryHook(key: WorkspaceQueryHookKey): ClassDecorator;
export function WorkspaceQueryHook(
  options: WorkspaceQueryHookOptions,
): ClassDecorator;
export function WorkspaceQueryHook(
  keyOrOptions: WorkspaceQueryHookKey | WorkspaceQueryHookOptions,
): ClassDecorator {
  const options: WorkspaceQueryHookOptions =
    keyOrOptions && typeof keyOrOptions === 'object'
      ? keyOrOptions
      : { key: keyOrOptions };

  // Default to PreHook
  if (!options.type) {
    options.type = WorkspaceQueryHookType.PreHook;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(WORKSPACE_QUERY_HOOK_METADATA, options)(target);
  };
}
