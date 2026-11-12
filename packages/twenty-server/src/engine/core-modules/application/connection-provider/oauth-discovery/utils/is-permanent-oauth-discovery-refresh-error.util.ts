import { OAuthError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { isAxiosError } from 'axios';

export const isPermanentOAuthDiscoveryRefreshError = (
  error: unknown,
): boolean => !(error instanceof OAuthError) && !isAxiosError(error);
