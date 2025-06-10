import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { createState } from 'twenty-ui/utilities';

export const currentWorkspaceMembersState = createState<
  CurrentWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
