import { isDefined } from 'twenty-shared/utils';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

// Request-driven readers must retain the caller's authority; background readers have no request context.
export const getRecordPermissionReadAuthContext = (
  workspaceId: string,
): WorkspaceAuthContext => {
  const caller = workspaceAuthContextStorage.getStore();
  if (!isDefined(caller)) return buildSystemAuthContext(workspaceId);
  if (caller.workspace.id !== workspaceId)
    throw new Error(
      'The read workspace does not match the authenticated workspace',
    );
  return caller;
};
