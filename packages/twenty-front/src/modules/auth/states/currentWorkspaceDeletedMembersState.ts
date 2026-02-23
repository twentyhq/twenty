import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type DeletedWorkspaceMember } from '~/generated-metadata/graphql';

export const currentWorkspaceDeletedMembersState = createStateV2<
  DeletedWorkspaceMember[]
>({
  key: 'currentWorkspaceDeletedMembersState',
  defaultValue: [],
});
