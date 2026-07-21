import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { isDefined } from 'twenty-shared/utils';
import { type AuthToken } from '~/generated-metadata/graphql';

// In-memory only — never persist this bearer token to localStorage.
export const playgroundApiKeyState = createAtomState<AuthToken | null>({
  key: 'playgroundApiKeyState',
  defaultValue: null,
});

// Returns true when the token is still valid `bufferMs` from now.
export const isPlaygroundApiKeyFresh = (
  token: AuthToken | null,
  bufferMs = 0,
): token is AuthToken =>
  isDefined(token) &&
  new Date(token.expiresAt).getTime() - Date.now() > bufferMs;
