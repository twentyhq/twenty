import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';

export const usePageLayoutSidePanelTarget = () => {
  const pageLayoutSidePanelTarget = useContext(
    PageLayoutSidePanelTargetContext,
  );

  if (!isDefined(pageLayoutSidePanelTarget)) {
    throw new Error(
      'usePageLayoutSidePanelTarget must be used within a page layout side panel page',
    );
  }

  return pageLayoutSidePanelTarget;
};
