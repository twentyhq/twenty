import { Injectable } from '@nestjs/common';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHookStorage } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/storage/workspace-query-hook.storage';
import { WorkspacePreQueryHookPayload } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/types/workspace-query-hook.type';
import { WorkspaceQueryHookKey } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookExplorer } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-query-hook.explorer';

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
    payload: WorkspacePreQueryHookPayload<T>,
  ): Promise<void> {
    const key: WorkspaceQueryHookKey = `${objectName}.${methodName}`;
    const preHookInstances =
      this.workspaceQueryHookStorage.getWorkspaceQueryPreHookInstances(key);

    if (!preHookInstances) {
      return;
    }

    for (const preHookInstance of preHookInstances) {
      await this.workspaceQueryHookExplorer.handleHook(
        [userId, workspaceId, payload],
        preHookInstance.instance,
        preHookInstance.host,
        preHookInstance.isRequestScoped,
      );
    }
  }
}
