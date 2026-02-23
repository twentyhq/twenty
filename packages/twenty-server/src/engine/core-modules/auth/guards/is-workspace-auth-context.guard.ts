import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isWorkspaceAuthContext = (
  context: RawAuthContext,
): context is WorkspaceAuthContext => {
  return (
    isDefined(context.workspace) &&
    (isDefined(context.userWorkspaceId) ||
      isDefined(context.apiKey) ||
      isDefined(context.application))
  );
};
