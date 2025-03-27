import { Workspace } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export type Workspaces = Pick<
  Workspace,
  'id' | 'logo' | 'displayName' | 'workspaceUrls'
>[];

export const workspacesState = createState<Workspaces>({
  key: 'workspacesState',
  defaultValue: [],
});
