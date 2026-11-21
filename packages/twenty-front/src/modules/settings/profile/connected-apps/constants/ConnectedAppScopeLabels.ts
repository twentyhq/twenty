import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Keyed by the OAuth scope values the server grants (OAUTH_SCOPES in twenty-server)
export const CONNECTED_APP_SCOPE_LABELS: Partial<
  Record<string, MessageDescriptor>
> = {
  api: msg`Can read and write records`,
  profile: msg`Can see your profile`,
};
