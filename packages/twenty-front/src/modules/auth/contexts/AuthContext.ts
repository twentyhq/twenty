import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { createContext } from 'react';
import { DeletedWorkspaceMember } from '~/generated-metadata/graphql';

export type AuthContextType = {
  currentWorkspaceMembers: CurrentWorkspaceMember[];
  currentWorkspaceDeletedMembers: DeletedWorkspaceMember[];
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);
