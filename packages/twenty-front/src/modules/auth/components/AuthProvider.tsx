import React from 'react';
import { useRecoilValue } from 'recoil';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersStates';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const currentWorkspaceDeletedMembers = useRecoilValue(
    currentWorkspaceDeletedMembersState,
  );

  return (
    <AuthContext.Provider
      value={{
        currentWorkspaceMembers,
        currentWorkspaceDeletedMembers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
