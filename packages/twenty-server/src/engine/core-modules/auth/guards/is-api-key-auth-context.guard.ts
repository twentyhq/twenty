import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isApiKeyAuthContext = <
  TContext extends Pick<WorkspaceAuthContext, 'type'>,
>(
  context: TContext,
): context is Extract<TContext, { type: 'apiKey' }> => {
  return context.type === 'apiKey';
};
