import { createState } from 'twenty-ui/utilities';
import { type AuthTokenPair } from '~/generated/graphql';
import { cookieStorageEffect } from '~/utils/recoil/cookieStorageEffect';

export const tokenPairState = createState<AuthTokenPair | null>({
  key: 'tokenPairState',
  defaultValue: null,
  effects: [
    cookieStorageEffect(
      'tokenPair',
      {},
      {
        validateInitFn: (payload: AuthTokenPair) =>
          Boolean(payload['accessOrWorkspaceAgnosticToken']),
      },
    ),
  ],
});
