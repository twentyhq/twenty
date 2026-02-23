import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const lastAuthenticatedWorkspaceDomainState = createStateV2<
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
  useCookieStorage: {
    cookieKey: 'lastAuthenticateWorkspaceDomain',
    attributes: {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
  },
});
