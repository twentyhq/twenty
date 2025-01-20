import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { WorkspaceActivationStatus } from '~/generated/graphql';

export const useIsWorkspaceActivationStatusSuspended = (): boolean => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  return (
    currentWorkspace?.activationStatus === WorkspaceActivationStatus.SUSPENDED
  );
};
