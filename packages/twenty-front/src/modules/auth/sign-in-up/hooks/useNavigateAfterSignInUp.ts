import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState.ts';
import { billingState } from '@/client-config/states/billingState.ts';
import { AppPath } from '@/types/AppPath.ts';

export const useNavigateAfterSignInUp = () => {
  const navigate = useNavigate();
  const billing = useRecoilValue(billingState);
  const navigateAfterSignInUp = (currentWorkspace: CurrentWorkspace) => {
    if (
      billing?.isBillingEnabled &&
      currentWorkspace.subscriptionStatus !== 'active'
    ) {
      navigate(AppPath.PlanRequired);
      return;
    }

    if (currentWorkspace.activationStatus === 'active') {
      navigate(AppPath.Index);
      return;
    }

    navigate(AppPath.CreateWorkspace);
  };
  return { navigateAfterSignInUp };
};
