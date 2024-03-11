import { createState } from '@/ui/utilities/state/utils/createState';
import { Workspace } from '~/generated/graphql';

export type Workspaces = Pick<Workspace, 'id' | 'logo' | 'displayName'>;

export const workspacesState = createState<Workspaces[] | null>({
  key: 'workspacesState',
  defaultValue: [],
});
