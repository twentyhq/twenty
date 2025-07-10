import { AuthToken } from '~/generated/graphql';
import { cookieStorageEffect } from '~/utils/recoil-effects';
import { createState } from 'twenty-ui/utilities';

export const loginTokenState = createState<AuthToken['token'] | null>({
  key: 'loginTokenState',
  defaultValue: null,
  effects: [
    cookieStorageEffect(
      'loginToken',
      {},
      {
        validateInitFn: (payload: AuthToken['token']) => Boolean(payload),
      },
    ),
  ],
});
