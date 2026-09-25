import { type Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export const PermissionFlagsDecorator: Decorator = (Story, { parameters }) => {
  const setCurrentUserWorkspace = useSetAtomState(currentUserWorkspaceState);

  const { permissionFlags }: { permissionFlags?: PermissionFlagType[] } =
    parameters;

  useEffect(() => {
    setCurrentUserWorkspace({
      permissionFlags: permissionFlags ?? [],
      twoFactorAuthenticationMethodSummary: [],
      isImpersonating: false,
      objectsPermissions: [],
    });
  }, [setCurrentUserWorkspace, permissionFlags]);

  return <Story />;
};
