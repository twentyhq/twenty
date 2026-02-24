import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useIsWorkspaceActivationStatusEqualsTo = (
  activationStatus: WorkspaceActivationStatus,
): boolean => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);
  return currentWorkspace?.activationStatus === activationStatus;
};
