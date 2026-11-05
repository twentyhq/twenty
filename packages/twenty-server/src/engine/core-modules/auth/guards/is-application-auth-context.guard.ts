import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isApplicationAuthContext = <
  TContext extends Pick<WorkspaceAuthContext, 'type'>,
>(
  context: TContext,
): context is Extract<TContext, { type: 'application' }> => {
  return context.type === 'application';
};
