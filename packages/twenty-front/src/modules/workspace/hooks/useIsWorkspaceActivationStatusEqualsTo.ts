import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useIsWorkspaceActivationStatusEqualsTo = (
  activationStatus: WorkspaceActivationStatus,
): boolean => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  return currentWorkspace?.activationStatus === activationStatus;
};
