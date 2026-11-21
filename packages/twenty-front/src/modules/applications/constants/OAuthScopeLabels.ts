import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Keyed by OAUTH_SCOPES in twenty-server; the api scope reaches only what the app's access allows
export const OAUTH_SCOPE_LABELS: Partial<Record<string, MessageDescriptor>> = {
  api: msg`Access your workspace data`,
  profile: msg`Read your profile`,
};
