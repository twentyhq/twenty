import { Injectable } from '@nestjs/common';

import merge from 'lodash.merge';

import { type QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';
import { type WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { type WorkspacePreQueryHookPayload } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class WorkspaceQueryHookService {
  constructor(
    private readonly workspaceQueryHookStorage: WorkspaceQueryHookStorage,
    private readonly workspaceQueryHookExplorer: WorkspaceQueryHookExplorer,
  ) {}

  //TODO : Refacto-common - Should be Common
  public async executePreQueryHooks<
    T extends WorkspaceResolverBuilderMethodNames | CommonQueryNames,
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
      const hookPayload = await this.workspaceQueryHookExplorer.handlePreHook(
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
  >(
    authContext: AuthContext,
    // TODO: We should allow wildcard for object name
    objectName: string,
    methodName: T,
    payload: QueryResultFieldValue,
  ): Promise<void> {
    const key: WorkspaceQueryHookKey = `${objectName}.${methodName}`;
    const postHookInstances =
      this.workspaceQueryHookStorage.getWorkspacePostQueryHookInstances(key);

    if (!postHookInstances) {
      return;
    }

    for (const postHookInstance of postHookInstances) {
      await this.workspaceQueryHookExplorer.handlePostHook(
        [authContext, objectName, payload],
        postHookInstance.instance,
        postHookInstance.host,
        postHookInstance.isRequestScoped,
      );
    }
  }
}
