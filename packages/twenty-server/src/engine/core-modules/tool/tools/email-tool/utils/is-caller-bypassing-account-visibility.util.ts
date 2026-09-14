import { type WorkspaceAuthContextType } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// A run with nobody behind it is the workspace acting on itself, so account visibility does not apply.
export const isCallerBypassingAccountVisibility = (
  callerType?: WorkspaceAuthContextType,
): boolean => {
  switch (callerType) {
    case 'application':
    case 'system':
      return true;
    default:
      return false;
  }
};
