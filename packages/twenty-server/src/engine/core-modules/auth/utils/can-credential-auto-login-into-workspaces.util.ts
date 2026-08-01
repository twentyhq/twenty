import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';

// Listing the workspaces a user belongs to is harmless and stays available
// for the whole session, but converting that credential into workspace access
// without re-authenticating is not: a workspace-agnostic session outlives a
// sign-out performed on a workspace subdomain (the workspace cannot clear a
// cookie it does not own), so it would otherwise hand the workspace back.
// Workspace-scoped credentials are unaffected: signing out of a workspace
// revokes them, so they cannot outlive the sign-out they would bypass.
export const canCredentialAutoLoginIntoWorkspaces = ({
  isWorkspaceScopedCredential,
  authenticatedAt,
  autoLoginWindow,
  now,
}: {
  isWorkspaceScopedCredential: boolean;
  authenticatedAt: Date | undefined;
  autoLoginWindow: string;
  now: Date;
}): boolean => {
  if (isWorkspaceScopedCredential) {
    return true;
  }

  // Legacy JWT pairs carry no authentication time, so they keep the
  // pre-session behavior until the cookie session cutover retires them.
  if (!isDefined(authenticatedAt)) {
    return true;
  }

  return addMilliseconds(authenticatedAt, ms(autoLoginWindow)) > now;
};
