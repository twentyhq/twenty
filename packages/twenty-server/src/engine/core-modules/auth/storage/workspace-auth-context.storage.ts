import { AsyncLocalStorage } from 'async_hooks';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { withWorkspaceDataContext } from 'src/engine/workspace-cache/storage/workspace-data-context.storage';

export const workspaceAuthContextStorage =
  new AsyncLocalStorage<WorkspaceAuthContext>();

export const getWorkspaceAuthContext = (): WorkspaceAuthContext => {
  const context = workspaceAuthContextStorage.getStore();

  if (!context) {
    throw new Error(
      'Workspace auth context not set. Operations must be wrapped with withWorkspaceAuthContext()',
    );
  }

  return context;
};

export const withWorkspaceAuthContext = <T>(
  context: WorkspaceAuthContext,
  fn: () => T | Promise<T>,
): T | Promise<T> => {
  return withWorkspaceDataContext(context.workspace.id, () =>
    workspaceAuthContextStorage.run(context, fn),
  );
};
