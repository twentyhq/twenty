import { createState } from 'twenty-ui/utilities';
import { AvailableWorkspacesToJoin } from '~/generated/graphql';

export const currentUserAvailableWorkspacesState = createState<
  AvailableWorkspacesToJoin[]
>({
  key: 'currentUserAvailableWorkspacesState',
  defaultValue: [],
});
