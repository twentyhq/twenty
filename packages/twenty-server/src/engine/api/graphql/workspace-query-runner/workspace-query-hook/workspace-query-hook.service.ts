import { Injectable } from '@nestjs/common';

import merge from 'lodash.merge';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { WorkspacePreQueryHookPayload } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class WorkspaceQueryHookService {
  constructor(
    private readonly workspaceQueryHookStorage: WorkspaceQueryHookStorage,
    private readonly workspaceQueryHookExplorer: WorkspaceQueryHookExplorer,
  ) {}

  public async executePreQueryHooks<
    T extends WorkspaceResolverBuilderMethodNames,
  >(
    authContext: AuthContext,
    // TODO: We should allow wildcard for object name
    objectName: string,
    methodName: T,
    payload: WorkspacePreQueryHookPayload<T>,
  ): Promise<WorkspacePreQueryHookPayload<T>> {
    const key: WorkspaceQueryHookKey = `${objectName}.${methodName}`;
    const preHookInstances =
      this.workspaceQueryHookStorage.getWorkspaceQueryPreHookInstances(key);

    if (!preHookInstances) {
      return payload;
    }

    for (const preHookInstance of preHookInstances) {
      // Deep merge all return of handleHook into payload before returning it
      const hookPayload = await this.workspaceQueryHookExplorer.handleHook(
        [authContext, objectName, payload],
        preHookInstance.instance,
        preHookInstance.host,
        preHookInstance.isRequestScoped,
      );

      // TODO: Is it really a good idea ?
      payload = merge(payload, hookPayload);
    }

    return payload;
  }

  public async executePostQueryHooks<
    T extends WorkspaceResolverBuilderMethodNames,
    U extends ObjectRecord = ObjectRecord,
  >(
    authContext: AuthContext,
    // TODO: We should allow wildcard for object name
    objectName: string,
    methodName: T,
    payload: U[],
  ): Promise<void> {
    const key: WorkspaceQueryHookKey = `${objectName}.${methodName}`;
    const postHookInstances =
      this.workspaceQueryHookStorage.getWorkspaceQueryPostHookInstances(key);

    if (!postHookInstances) {
      return;
    }

    for (const postHookInstance of postHookInstances) {
      await this.workspaceQueryHookExplorer.handleHook(
        [authContext, objectName, payload],
        postHookInstance.instance,
        postHookInstance.host,
        postHookInstance.isRequestScoped,
      );
    }
  }
}
