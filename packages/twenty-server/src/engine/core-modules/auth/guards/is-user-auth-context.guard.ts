import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isUserAuthContext = <
  TContext extends Pick<WorkspaceAuthContext, 'type'>,
>(
  context: TContext,
): context is Extract<TContext, { type: 'user' }> => {
  return context.type === 'user';
};
