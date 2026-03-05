import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type CurrentWorkspaceMember = Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | '__typename'
>;

export const currentWorkspaceMemberState =
  createAtomState<CurrentWorkspaceMember | null>({
    key: 'currentWorkspaceMemberState',
    defaultValue: null,
  });
