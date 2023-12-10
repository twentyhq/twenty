import { atom } from 'recoil';

import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const currentWorkspaceMemberState = atom<WorkspaceMember | null>({
  key: 'currentWorkspaceMemberState',
  default: null,
});
