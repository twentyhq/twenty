import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  type TwoFactorAuthenticationMethodSummary,
  InitiateOtpProvisioningDocument,
} from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentUserWorkspaceTwoFactorAuthentication = () => {
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const [initiateCurrentUserWorkspaceOtpProvisioning] =
    useMutation(InitiateOtpProvisioningDocument);

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
