import { AsyncLocalStorage } from 'async_hooks';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const workspaceAuthContextStorage =
  new AsyncLocalStorage<WorkspaceAuthContext>();

export const getWorkspaceAuthContextOrUndefined = ():
  | WorkspaceAuthContext
  | undefined => workspaceAuthContextStorage.getStore();

export const getWorkspaceAuthContext = (): WorkspaceAuthContext => {
  const context = getWorkspaceAuthContextOrUndefined();

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
