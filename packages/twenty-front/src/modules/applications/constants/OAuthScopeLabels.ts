import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Keyed by the OAuth scope values the server grants (OAUTH_SCOPES in twenty-server).
// The api scope reaches whatever the app's access allows, so the label does not promise more.
export const OAUTH_SCOPE_LABELS: Partial<Record<string, MessageDescriptor>> = {
  api: msg`Access your workspace data`,
  profile: msg`Read your profile`,
};
