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

  // ms() yields undefined for a duration it cannot parse, and a negative one
  // parses into a window nothing can fall inside. Reading either as "always"
  // would silently drop the boundary this check exists for, and as "never"
  // would lock everyone out of workspace entry, so both fall back to the
  // documented default. Zero is kept: it deliberately turns the bridge off.
  const isUsableWindow =
    Number.isFinite(parsedWindowMs) && (parsedWindowMs as number) >= 0;

  const autoLoginWindowMs = isUsableWindow
    ? (parsedWindowMs as number)
    : DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW_MS;

  return addMilliseconds(authenticatedAt, autoLoginWindowMs) > now;
};
