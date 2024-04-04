import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState.ts';
import { previousUrlState } from '@/auth/states/previousUrlState';
import { billingState } from '@/client-config/states/billingState.ts';
import { AppPath } from '@/types/AppPath.ts';
import { WorkspaceMember } from '~/generated/graphql.tsx';

export const useNavigateAfterSignInUp = () => {
  const navigate = useNavigate();
  const billing = useRecoilValue(billingState);
  const previousUrl = useRecoilValue(previousUrlState);
  const navigateAfterSignInUp = useCallback(
    (
      currentWorkspace: CurrentWorkspace,
      currentWorkspaceMember: WorkspaceMember | null,
    ) => {
      if (
        billing?.isBillingEnabled === true &&
        !['active', 'trialing'].includes(currentWorkspace.subscriptionStatus)
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
      if (previousUrl !== '') navigate(previousUrl);
      else navigate(AppPath.Index);
    },
    [billing, previousUrl, navigate],
  );
  return { navigateAfterSignInUp };
};
