import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { createState } from '@ui/utilities/state/utils/createState';

export const currentWorkspaceMembersState = createState<
  CurrentWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
