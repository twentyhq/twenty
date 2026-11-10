import { OAuthError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { isAxiosError } from 'axios';

// The SDK throws plain errors for an incompatible server or a malformed token response: retrying will not fix them.
export const isPermanentOAuthDiscoveryRefreshError = (
  error: unknown,
): boolean => !(error instanceof OAuthError) && !isAxiosError(error);
