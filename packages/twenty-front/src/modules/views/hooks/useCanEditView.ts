import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRecoilValue } from 'recoil';

export const useCanEditView = () => {
  const { currentView } = useGetCurrentViewOnly();
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);

  const canEditView =
    !!currentView && currentView.createdById === currentUserWorkspace?.id;

  return { canEditView };
};
