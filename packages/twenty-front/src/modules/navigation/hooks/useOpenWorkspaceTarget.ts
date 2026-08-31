import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { WorkspaceTargetArtifactHostContext } from '@/navigation/contexts/WorkspaceTargetArtifactHostContext';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useOpenSidePanelArtifact } from '@/side-panel/artifacts/hooks/useOpenSidePanelArtifact';
import { resolveSidePanelArtifact } from '@/side-panel/artifacts/utils/resolveSidePanelArtifact';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { isSettingsPath } from '~/utils/isSettingsPath';

type OpenWorkspaceTargetParams = {
  path: string;
};

// Workspace targets keep one canonical URL. A surface can opt into hosting
// their native side-panel projection without changing the target itself.
export const useOpenWorkspaceTarget = () => {
  const store = useStore();
  const navigate = useNavigate();
  const canHostArtifacts = useContext(WorkspaceTargetArtifactHostContext);
  const { openSettingsMenu } = useOpenSettingsMenu();
  const { openSidePanelArtifact } = useOpenSidePanelArtifact();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const openWorkspaceTarget = useCallback(
    ({ path }: OpenWorkspaceTargetParams) => {
      if (!canHostArtifacts) {
        if (isSettingsPath(path)) {
          openSettingsMenu();
        }

        navigate(path);

        return;
      }

      const artifact = resolveSidePanelArtifact({
        artifactPath: path,
        objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
        views: store.get(viewsSelector.atom),
      });

      // A target whose metadata disappeared is no longer safe to project in
      // the panel. Canonical navigation above does not depend on projection.
      if (artifact === null) {
        return;
      }

      if (artifact.kind === 'record') {
        openRecordInSidePanel({
          objectNameSingular: artifact.objectMetadataItem.nameSingular,
          recordId: artifact.recordId,
          artifactPath: artifact.artifactPath,
        });
      } else {
        openSidePanelArtifact({ artifactPath: artifact.artifactPath });
      }
    },
    [
      canHostArtifacts,
      navigate,
      openRecordInSidePanel,
      openSettingsMenu,
      openSidePanelArtifact,
      store,
    ],
  );

  return { openWorkspaceTarget };
};
