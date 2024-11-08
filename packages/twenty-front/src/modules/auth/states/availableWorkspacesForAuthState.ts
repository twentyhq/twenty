import { createState } from 'twenty-ui';
import { FindAvailableWorkspacesByEmailQuery } from '~/generated/graphql';

export const availableWorkspacesForAuthState = createState<Omit<
  FindAvailableWorkspacesByEmailQuery['findAvailableWorkspacesByEmail'],
  '__typename'
> | null>({
  key: 'availableWorkspacesForAuthState',
  defaultValue: null,
});
