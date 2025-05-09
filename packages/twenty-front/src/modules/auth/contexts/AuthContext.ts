import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { createContext } from 'react';

export type AuthContextType = {
  currentWorkspaceMembers: CurrentWorkspaceMember[];
  currentWorkspaceMembersWithDeleted: CurrentWorkspaceMember[];
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);
