import { cookieStorageEffect } from '~/utils/recoil-effects';
import { createState } from 'twenty-ui';

export const lastAuthenticatedWorkspaceDomainState = createState<{
  subdomain: string;
  workspaceId: string;
  cookieAttributes?: Cookies.CookieAttributes;
} | null>({
  key: 'lastAuthenticateWorkspaceDomain',
  defaultValue: null,
  effects: [
    cookieStorageEffect('lastAuthenticateWorkspaceDomain', {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    }),
  ],
});
