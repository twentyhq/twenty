import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export type CurrentWorkspaceMember = Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | '__typename'
>;

export const currentWorkspaceMemberState =
  createStateV2<CurrentWorkspaceMember | null>({
    key: 'currentWorkspaceMemberState',
    defaultValue: null,
  });
