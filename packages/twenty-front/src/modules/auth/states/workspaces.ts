import { createState } from '@ui/utilities/state/utils/createState';
import { WorkspaceWithWorkspaceUrl } from '~/generated/graphql';

export type Workspaces = Pick<
  WorkspaceWithWorkspaceUrl,
  'id' | 'logo' | 'displayName' | 'workspaceUrl'
>[];

export const workspacesState = createState<Workspaces>({
  key: 'workspacesState',
  defaultValue: [],
});
