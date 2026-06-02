import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { isDefined } from 'twenty-shared/utils';
import { type AuthToken } from '~/generated-metadata/graphql';

// In-memory only: a short-lived, full-permission bearer token. Keeping it out of
// localStorage bounds the exfiltration window to the current tab and leaves no
// usable credential at rest after the tab closes.
export const playgroundApiKeyState = createAtomState<AuthToken | null>({
  key: 'playgroundApiKeyState',
  defaultValue: null,
});

// Usable only while it stays valid for at least `bufferMs` longer. Consumers pass
// no buffer (reject the moment it expires); the launcher passes a buffer so it
// re-mints before a near-expired token can fail mid-session.
export const isPlaygroundApiKeyFresh = (
  token: AuthToken | null,
  bufferMs = 0,
): token is AuthToken =>
  isDefined(token) &&
  new Date(token.expiresAt).getTime() - Date.now() > bufferMs;
