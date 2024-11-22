import { createState } from 'twenty-ui';

import { AuthTokenPair } from '~/generated/graphql';
import { cookieStorageEffect } from '~/utils/recoil-effects';
import {
  getWorkspaceSubdomain,
  twentyHostname,
} from '~/utils/workspace-url.helper';

export const tokenPairState = createState<AuthTokenPair | null>({
  key: 'tokenPairState',
  defaultValue: null,
  effects: [
    cookieStorageEffect(
      `${getWorkspaceSubdomain() ?? 'twentyRoot'}TokenPair`,
      {
        Domain: `.${twentyHostname}`,
      },
      {
        validateInitFn: (payload: AuthTokenPair) =>
          Boolean(payload['accessToken']),
      },
    ),
  ],
});
