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
const DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW_MS = 10 * 60 * 1000;

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

  const parsedWindowMs = ms(autoLoginWindow);

  // ms() yields undefined for a duration it cannot parse. Reading that as
  // "always" would silently drop the boundary this whole check exists for,
  // and reading it as "never" would lock everyone out of workspace entry, so
  // a malformed window falls back to the documented default instead.
  const autoLoginWindowMs = Number.isFinite(parsedWindowMs)
    ? parsedWindowMs
    : DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW_MS;

  return addMilliseconds(authenticatedAt, autoLoginWindowMs) > now;
};
