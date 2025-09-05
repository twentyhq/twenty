import { createState } from 'twenty-ui/utilities';
import { type DeletedWorkspaceMember } from '~/generated-metadata/graphql';

export const currentWorkspaceDeletedMembersState = createState<
  DeletedWorkspaceMember[]
>({
  key: 'currentWorkspaceDeletedMembersState',
  defaultValue: [],
});
