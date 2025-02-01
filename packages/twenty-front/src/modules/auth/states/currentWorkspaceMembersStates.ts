import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { createState } from "twenty-shared";

export const currentWorkspaceMembersState = createState<
  CurrentWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
