import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useIsWorkspaceActivationStatusEqualsTo = (
  activationStatus: WorkspaceActivationStatus,
): boolean => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  return currentWorkspace?.activationStatus === activationStatus;
};
