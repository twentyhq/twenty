import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { createState } from 'twenty-ui/utilities';
import { type WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';

export type CurrentWorkspaceMember = Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | '__typename'
> & {
  originalNumberFormatChoice?: WorkspaceMemberNumberFormatEnum | null;
};

export const currentWorkspaceMemberState =
  createState<CurrentWorkspaceMember | null>({
    key: 'currentWorkspaceMemberState',
    defaultValue: null,
  });
