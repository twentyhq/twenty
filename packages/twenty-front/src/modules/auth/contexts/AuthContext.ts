import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { createContext } from 'react';
import { type DeletedWorkspaceMember } from '~/generated-metadata/graphql';

export type AuthContextType = {
  currentWorkspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceDeletedMembers: DeletedWorkspaceMember[];
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);
