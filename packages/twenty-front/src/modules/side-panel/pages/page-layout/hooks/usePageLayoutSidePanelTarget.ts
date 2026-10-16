import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';

export const usePageLayoutSidePanelTarget = () => {
  const pageLayoutSidePanelTarget = useContext(
    PageLayoutSidePanelTargetContext,
  );

  if (!isDefined(pageLayoutSidePanelTarget)) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      'usePageLayoutSidePanelTarget must be used within a page layout side panel page',
    );
  }

  return pageLayoutSidePanelTarget;
};
