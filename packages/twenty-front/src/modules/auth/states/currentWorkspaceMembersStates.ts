import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { createState } from 'twenty-ui';

export const currentWorkspaceMembersState = createState<
  CurrentWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
