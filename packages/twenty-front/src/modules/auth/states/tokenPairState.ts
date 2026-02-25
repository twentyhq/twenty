import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

export const tokenPairState = createAtomState<AuthTokenPair | null>({
  key: 'tokenPairState',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: 'tokenPair',
    validateInitFn: (payload: AuthTokenPair) =>
      Boolean(payload['accessOrWorkspaceAgnosticToken']),
  },
});
