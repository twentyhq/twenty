import { createState } from 'twenty-ui/utilities';
import { AvailableWorkspace } from '~/generated/graphql';

export const availableWorkspacesState = createState<Array<AvailableWorkspace>>({
  key: 'availableWorkspacesState',
  defaultValue: [],
});
