import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import {
  type TwoFactorAuthenticationMethodDto,
  useInitiateOtpProvisioningMutation,
} from '~/generated-metadata/graphql';

export const useCurrentUserWorkspaceTwoFactorAuthentication = () => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const [initiateCurrentUserWorkspaceOtpProvisioning] =
    useInitiateOtpProvisioningMutation();

  const currentUserWorkspaceTwoFactorAuthenticationMethods = useMemo(() => {
    const methods: Record<string, TwoFactorAuthenticationMethodDto> = {};

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
