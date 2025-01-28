import { createState } from '@ui/utilities/state/utils/createState';

import { AuthProviders } from '~/generated/graphql';

export const workspaceAuthProvidersState = createState<AuthProviders | null>({
  key: 'workspaceAuthProvidersState',
  defaultValue: null,
});
