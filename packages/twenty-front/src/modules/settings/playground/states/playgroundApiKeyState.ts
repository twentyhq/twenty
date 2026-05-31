import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AuthToken } from '~/generated-metadata/graphql';

export const playgroundApiKeyState = createAtomState<AuthToken | null>({
  key: 'playgroundApiKeyState',
  defaultValue: null,
  useLocalStorage: true,
});

// Persisted state can be a legacy raw token string from before AuthToken was
// adopted; treat anything without the AuthToken shape as missing.
export const isValidPlaygroundApiKey = (value: unknown): value is AuthToken =>
  value !== null &&
  typeof value === 'object' &&
  'token' in value &&
  typeof (value as { token: unknown }).token === 'string' &&
  'expiresAt' in value &&
  typeof (value as { expiresAt: unknown }).expiresAt === 'string';
