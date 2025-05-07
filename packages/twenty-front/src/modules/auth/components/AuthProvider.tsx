import React from 'react';
import { useRecoilValue } from 'recoil';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { currentWorkspaceMembersWithDeletedState } from '@/auth/states/currentWorkspaceMembersWithDeletedStates';

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const currentWorkspaceMembersWithDeleted = useRecoilValue(
    currentWorkspaceMembersWithDeletedState,
  );

  return (
    <AuthContext.Provider
      value={{
        currentWorkspaceMembers,
        currentWorkspaceMembersWithDeleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
