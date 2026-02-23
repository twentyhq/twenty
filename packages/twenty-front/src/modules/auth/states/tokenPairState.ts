import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

export const tokenPairState = createStateV2<AuthTokenPair | null>({
  key: 'tokenPairState',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: 'tokenPair',
    validateInitFn: (payload: AuthTokenPair) =>
      Boolean(payload['accessOrWorkspaceAgnosticToken']),
  },
});
