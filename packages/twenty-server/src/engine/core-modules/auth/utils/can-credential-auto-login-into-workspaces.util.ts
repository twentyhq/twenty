import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW } from 'src/engine/core-modules/auth/constants/default-workspace-auto-login-window.constant';

// A workspace-agnostic session outlives a sign-out performed on a workspace
// subdomain, since the workspace cannot clear a cookie it does not own, so
// converting it into workspace access would hand the workspace back.
const DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW_MS = ms(
  DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW,
);

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
  // pre-session behavior until the cutover retires them.
  if (!isDefined(authenticatedAt)) {
    return true;
  }

  const parsedWindowMs = ms(autoLoginWindow);

  // An unparseable or negative window would silently drop the boundary or lock
  // everyone out. Zero is kept, since it deliberately turns the bridge off.
  const isUsableWindow =
    Number.isFinite(parsedWindowMs) && (parsedWindowMs as number) >= 0;

  const autoLoginWindowMs = isUsableWindow
    ? (parsedWindowMs as number)
    : DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW_MS;

  return addMilliseconds(authenticatedAt, autoLoginWindowMs) > now;
};
