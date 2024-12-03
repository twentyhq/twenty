import { cookieStorageEffect } from '~/utils/recoil-effects';
import { Workspace } from '~/generated/graphql';
import { createState } from 'twenty-ui';

export const lastAuthenticateWorkspaceState = createState<
  | (Pick<Workspace, 'id' | 'subdomain'> & {
      cookieAttributes?: Cookies.CookieAttributes;
    })
  | null
>({
  key: 'lastAuthenticateWorkspaceState',
  defaultValue: null,
  effects: [
    cookieStorageEffect('lastAuthenticateWorkspace', {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    }),
  ],
});
