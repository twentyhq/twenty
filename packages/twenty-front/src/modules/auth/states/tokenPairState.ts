import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

export const tokenPairState = createState<AuthTokenPair | null>({
  key: 'tokenPairState',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: 'tokenPair',
    validateInitFn: (payload: AuthTokenPair) =>
      Boolean(payload['accessOrWorkspaceAgnosticToken']),
  },
});
