import { cookieStorageEffect } from '~/utils/recoil/cookieStorageEffect';
import { createState } from 'twenty-ui/utilities';

export const lastAuthenticatedWorkspaceDomainState = createState<
  | {
      workspaceUrl: string;
      workspaceId: string;
      cookieAttributes?: Cookies.CookieAttributes;
    }
  | null
  // this type is necessary to let the deletion of cookie. Without the domain the cookie is not deleted.
  | { cookieAttributes?: Cookies.CookieAttributes }
>({
  key: 'lastAuthenticateWorkspaceDomain',
  defaultValue: null,
  effects: [
    cookieStorageEffect('lastAuthenticateWorkspaceDomain', {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    }),
  ],
});
