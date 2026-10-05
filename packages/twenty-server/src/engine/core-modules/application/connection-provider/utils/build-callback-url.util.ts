import { ApiPath } from 'twenty-shared/types';

// Workspace-agnostic by design: the workspace identity travels in the
// signed `state` parameter, so a single redirect URL configured at the
// OAuth provider serves every workspace.
export const buildAppOAuthCallbackUrl = (serverUrl: string): string =>
  new URL(`/${ApiPath.Auth}/apps/callback`, serverUrl).toString();
