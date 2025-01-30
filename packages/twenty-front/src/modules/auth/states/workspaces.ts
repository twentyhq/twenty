import { createState } from '@ui/utilities/state/utils/createState';
import { Workspace } from '~/generated/graphql';

export type Workspaces = Pick<
  Workspace,
  'id' | 'logo' | 'displayName' | 'workspaceUrls'
>[];

export const workspacesState = createState<Workspaces>({
  key: 'workspacesState',
  defaultValue: [],
});
