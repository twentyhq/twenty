import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type SidePanelArtifact } from '@/side-panel/artifacts/types/SidePanelArtifact';
import { resolveSidePanelArtifact } from '@/side-panel/artifacts/utils/resolveSidePanelArtifact';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useSidePanelArtifact = (
  artifactPath: string | undefined,
): SidePanelArtifact | null => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  return useMemo(
    () =>
      isDefined(artifactPath)
        ? resolveSidePanelArtifact({
            artifactPath,
            objectMetadataItems,
            views,
          })
        : null,
    [artifactPath, objectMetadataItems, views],
  );
};

export const useCurrentSidePanelArtifact = (): SidePanelArtifact | null => {
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const currentNavigationStackItem = sidePanelNavigationStack.at(-1);

  return useSidePanelArtifact(currentNavigationStackItem?.artifactPath);
};
