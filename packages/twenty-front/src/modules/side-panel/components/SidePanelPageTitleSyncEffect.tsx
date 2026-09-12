import { useUpdateSidePanelPageInfo } from '@/side-panel/hooks/useUpdateSidePanelPageInfo';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelPageTitleSyncEffect = ({
  pageTitle,
}: {
  pageTitle?: string;
}) => {
  const workspaceSurface = useWorkspaceSurface();
  const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();

  useEffect(() => {
    if (workspaceSurface.type === 'side-panel' && isDefined(pageTitle)) {
      updateSidePanelPageInfo({ pageTitle });
    }
  }, [pageTitle, updateSidePanelPageInfo, workspaceSurface.type]);

  return null;
};
