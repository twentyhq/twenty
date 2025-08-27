import { type Decorator } from '@storybook/react';

import { AuthContext } from '@/auth/contexts/AuthContext';

export const AuthContextDecorator: Decorator = (Story) => {
  return (
    <AuthContext.Provider
      value={{
        currentWorkspaceMembers: [],
        currentWorkspaceDeletedMembers: [],
      }}
    >
      <Story />
    </AuthContext.Provider>
  );
};
