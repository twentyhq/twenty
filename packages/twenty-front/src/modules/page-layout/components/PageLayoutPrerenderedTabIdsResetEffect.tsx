import { useEffect } from 'react';

import { pageLayoutPrerenderedTabIdsComponentState } from '@/page-layout/states/pageLayoutPrerenderedTabIdsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

// Prerendering is a within-visit optimization: without the reset, reopening
// a record would mount every tab hovered during the previous visit at once.
export const PageLayoutPrerenderedTabIdsResetEffect = () => {
  const setPageLayoutPrerenderedTabIds = useSetAtomComponentState(
    pageLayoutPrerenderedTabIdsComponentState,
  );

  useEffect(
    () => () => setPageLayoutPrerenderedTabIds([]),
    [setPageLayoutPrerenderedTabIds],
  );

  return null;
};
