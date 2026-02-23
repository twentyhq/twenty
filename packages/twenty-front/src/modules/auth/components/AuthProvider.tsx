import React from 'react';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const currentWorkspaceMembers = useRecoilValueV2(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceDeletedMembers = useRecoilValueV2(
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
