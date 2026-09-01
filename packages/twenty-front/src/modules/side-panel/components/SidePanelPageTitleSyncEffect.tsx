import { useUpdateSidePanelPageInfo } from '@/side-panel/hooks/useUpdateSidePanelPageInfo';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useEffect } from 'react';

export const SidePanelPageTitleSyncEffect = ({
  pageTitle,
}: {
  pageTitle?: string;
}) => {
  const workspaceSurface = useWorkspaceSurface();
  const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();

  useEffect(() => {
    if (workspaceSurface.type === 'side-panel' && pageTitle !== undefined) {
      updateSidePanelPageInfo({ pageTitle });
    }
  }, [pageTitle, updateSidePanelPageInfo, workspaceSurface.type]);

  return null;
};
