import { cookieStorageEffect } from '~/utils/recoil-effects';
import { Workspace } from '~/generated/graphql';
import { createState } from 'twenty-ui';
import { getWorkspaceMainDomain } from '~/utils/workspace-url.helper';

export const lastAuthenticateWorkspaceState = createState<Pick<
  Workspace,
  'id' | 'subdomain'
> | null>({
  key: 'lastAuthenticateWorkspaceState',
  defaultValue: null,
  effects: [
    cookieStorageEffect('lastAuthenticateWorkspace', {
      domain: `.${getWorkspaceMainDomain()}`,
    }),
  ],
});
