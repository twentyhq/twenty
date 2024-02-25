import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState.ts';
import { billingState } from '@/client-config/states/billingState.ts';
import { AppPath } from '@/types/AppPath.ts';
import { WorkspaceMember } from '~/generated/graphql.tsx';

export const useNavigateAfterSignInUp = () => {
  const navigate = useNavigate();
  const billing = useRecoilValue(billingState);
  const navigateAfterSignInUp = useCallback(
    (
      currentWorkspace: CurrentWorkspace,
      currentWorkspaceMember: WorkspaceMember | null,
    ) => {
      if (
        billing?.isBillingEnabled &&
        currentWorkspace.subscriptionStatus !== 'active'
      ) {
        navigate(AppPath.PlanRequired);
        return;
      }

      if (currentWorkspace.activationStatus !== 'active') {
        navigate(AppPath.CreateWorkspace);
        return;
      }

      if (
        !currentWorkspaceMember?.name.firstName ||
        !currentWorkspaceMember?.name.lastName
      ) {
        navigate(AppPath.CreateProfile);
        return;
      }

      navigate(AppPath.Index);
    },
    [billing, navigate],
  );
  return { navigateAfterSignInUp };
};
