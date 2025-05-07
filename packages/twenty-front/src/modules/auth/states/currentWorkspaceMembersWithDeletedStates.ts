import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { createState } from 'twenty-ui/utilities';

export const currentWorkspaceMembersWithDeletedState = createState<
  CurrentWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersWithDeletedState',
  defaultValue: [],
});
