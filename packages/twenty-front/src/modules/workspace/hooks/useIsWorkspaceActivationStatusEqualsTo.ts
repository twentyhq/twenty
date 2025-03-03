import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { WorkspaceActivationStatus } from 'twenty-shared';

export const useIsWorkspaceActivationStatusEqualsTo = (
  activationStatus: WorkspaceActivationStatus,
): boolean => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  return currentWorkspace?.activationStatus === activationStatus;
};
