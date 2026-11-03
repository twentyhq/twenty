import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { limitToDocumentIframeMediaPermissions } from '@/media-access/utils/limitToDocumentIframeMediaPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useWorkspaceIframeMediaPermissions = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return limitToDocumentIframeMediaPermissions(
    currentWorkspace?.iframeMediaPermissions ?? [],
  );
};
