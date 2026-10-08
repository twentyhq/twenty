import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW } from 'src/engine/core-modules/auth/constants/default-workspace-auto-login-window.constant';

// A workspace can't clear a cookie it doesn't own, so an agnostic session outlives a subdomain sign-out and,
// converted into workspace access without a bound, would hand the workspace back
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

  // Legacy JWT pairs carry no authentication time, so they keep pre-session behavior
  if (!isDefined(authenticatedAt)) {
    return true;
  }

  const parsedWindowMs = ms(autoLoginWindow);

  // An unparseable or negative window would drop the boundary or lock everyone out; zero deliberately turns the bridge off
  const isUsableWindow =
    Number.isFinite(parsedWindowMs) && (parsedWindowMs as number) >= 0;

  const autoLoginWindowMs = isUsableWindow
    ? (parsedWindowMs as number)
    : DEFAULT_WORKSPACE_AUTO_LOGIN_WINDOW_MS;

  return addMilliseconds(authenticatedAt, autoLoginWindowMs) > now;
};
