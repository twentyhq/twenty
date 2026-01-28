import { AsyncLocalStorage } from 'async_hooks';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

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
  return workspaceAuthContextStorage.run(context, fn);
};
