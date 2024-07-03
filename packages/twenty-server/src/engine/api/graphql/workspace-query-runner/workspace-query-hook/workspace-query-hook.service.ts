import { Injectable } from '@nestjs/common';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/storage/workspace-query-hook.storage';
import { WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer';
import { WorkspaceQueryHookArgs } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';

@Injectable()
export class WorkspaceQueryHookService {
  constructor(
    private readonly workspaceQueryHookStorage: WorkspaceQueryHookStorage,
    private readonly workspaceQueryHookExplorer: WorkspaceQueryHookExplorer,
  ) {}

  public async executePreQueryHooks<
    T extends WorkspaceResolverBuilderMethodNames,
  >(
    userId: string | undefined,
    workspaceId: string,
    objectName: string,
    methodName: T,
    args: WorkspaceQueryHookArgs<T>,
  ): Promise<void> {
    const key: WorkspaceQueryHookKey = `${objectName}.${methodName}`;
    const preHookInstances =
      this.workspaceQueryHookStorage.getWorkspaceQueryPreHookInstances(key);

    if (!preHookInstances) {
      return;
    }

    for (const preHookInstance of preHookInstances) {
      await this.workspaceQueryHookExplorer.handleHook(
        [userId, workspaceId, args],
        preHookInstance.instance,
        preHookInstance.host,
        preHookInstance.isRequestScoped,
      );
    }
  }
}
