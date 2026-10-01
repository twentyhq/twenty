import { useEffect } from 'react';

import { pageLayoutPrerenderedTabIdsComponentState } from '@/page-layout/states/pageLayoutPrerenderedTabIdsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

// Without the reset, reopening a record would mount every tab hovered on the previous visit.
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
