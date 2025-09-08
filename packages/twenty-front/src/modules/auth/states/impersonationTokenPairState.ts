import { createState } from 'twenty-ui/utilities';
import { type AuthTokenPair } from '~/generated/graphql';
import { cookieStorageEffect } from '~/utils/recoil-effects';

export const impersonationTokenPairState = createState<AuthTokenPair | null>({
  key: 'impersonationTokenPairState',
  defaultValue: null,
  effects: [
    cookieStorageEffect(
      'impersonationTokenPair',
      {},
      {
        validateInitFn: (payload: AuthTokenPair) =>
          Boolean(payload['accessOrWorkspaceAgnosticToken']),
      },
    ),
  ],
});