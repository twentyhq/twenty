import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { type DeletedWorkspaceMember } from '~/generated-metadata/graphql';

export const currentWorkspaceDeletedMembersState = createState<
  DeletedWorkspaceMember[]
>({
  key: 'currentWorkspaceDeletedMembersState',
  defaultValue: [],
});
