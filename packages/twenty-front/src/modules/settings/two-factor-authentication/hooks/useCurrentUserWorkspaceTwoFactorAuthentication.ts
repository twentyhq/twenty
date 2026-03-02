import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useMemo } from 'react';
import {
  type TwoFactorAuthenticationMethodSummary,
  useInitiateOtpProvisioningMutation,
} from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentUserWorkspaceTwoFactorAuthentication = () => {
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const [initiateCurrentUserWorkspaceOtpProvisioning] =
    useInitiateOtpProvisioningMutation();

  const currentUserWorkspaceTwoFactorAuthenticationMethods = useMemo(() => {
    const methods: Record<string, TwoFactorAuthenticationMethodSummary> = {};

    (currentUserWorkspace?.twoFactorAuthenticationMethodSummary ?? []).forEach(
      (method) => (methods[method.strategy] = method),
    );

    return methods;
  }, [currentUserWorkspace]);

  return {
    currentUserWorkspaceTwoFactorAuthenticationMethods,
    initiateCurrentUserWorkspaceOtpProvisioning,
  };
};
