import React from 'react';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const currentWorkspaceMembers = useAtomValue(currentWorkspaceMembersState);
  const currentWorkspaceDeletedMembers = useAtomValue(
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
