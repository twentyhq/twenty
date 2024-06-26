import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isDefined } from '~/utils/isDefined';

export const useWorkspaceHasSubscription = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return isDefined(currentWorkspace?.currentBillingSubscription);
};
