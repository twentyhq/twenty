// Workspace-agnostic by design: the workspace identity travels in the
// signed `state` parameter, so a single redirect URL configured at the
// OAuth provider serves every workspace.
export const buildAppOAuthCallbackUrl = (serverUrl: string): string =>
  new URL('/apps/oauth/callback', serverUrl).toString();
