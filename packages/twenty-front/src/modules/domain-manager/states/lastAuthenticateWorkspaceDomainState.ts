import { cookieStorageEffect } from '~/utils/recoil-effects';
import { Workspace } from '~/generated/graphql';
import { createState } from 'twenty-ui';

export const lastAuthenticateWorkspaceDomainState = createState<
  | (Pick<Workspace, 'id' | 'subdomain'> & {
      cookieAttributes?: Cookies.CookieAttributes;
    })
  | null
>({
  key: 'lastAuthenticateWorkspaceDomain',
  defaultValue: null,
  effects: [
    cookieStorageEffect('lastWorkspaceDomainState', {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    }),
  ],
});
