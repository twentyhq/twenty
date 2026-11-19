import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type Role } from '~/generated-metadata/graphql';

export type CurrentWorkspaceMember = Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | '__typename'
> & {
  roles?: Pick<Role, 'universalIdentifier'>[] | null;
};

export const currentWorkspaceMemberState =
  createAtomState<CurrentWorkspaceMember | null>({
    key: 'currentWorkspaceMemberState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
