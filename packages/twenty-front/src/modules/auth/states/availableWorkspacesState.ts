import { createState } from 'twenty-ui/utilities';
import { CheckUserExistOutput } from '~/generated/graphql';

export const availableWorkspacesState = createState<
  CheckUserExistOutput['availableWorkspaces']
>({
  key: 'availableWorkspacesState',
  defaultValue: [],
});
