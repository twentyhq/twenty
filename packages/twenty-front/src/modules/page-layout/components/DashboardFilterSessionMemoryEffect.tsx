import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { dashboardFilterSessionSearchFamilyState } from '@/page-layout/states/dashboardFilterSessionSearchFamilyState';
import { getDashboardFilterSearch } from '@/page-layout/utils/getDashboardFilterSearch';
import { getDashboardFilterSessionMemoryUpdate } from '@/page-layout/utils/getDashboardFilterSessionMemoryUpdate';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const DashboardFilterSessionMemoryEffect = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const pageLayoutId = currentPageLayout.id;
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore();
  const urlDashboardFilterSearch = getDashboardFilterSearch(
    new URLSearchParams(location.search),
  );

  // Follows the URL, which no bar event covers (entry, links); the memory is read, not
  // subscribed, so the handlers' earlier memory write never re-runs it on a stale URL
  useEffect(() => {
    if (isPageLayoutInEditMode) {
      return;
    }

    const rememberedSearchAtom =
      dashboardFilterSessionSearchFamilyState.atomFamily({ pageLayoutId });
    const update = getDashboardFilterSessionMemoryUpdate({
      search: location.search,
      rememberedDashboardFilterSearch: store.get(rememberedSearchAtom),
    });

    if (update.type === 'REMEMBER') {
      store.set(rememberedSearchAtom, update.dashboardFilterSearch);
    }

    if (update.type === 'RESTORE') {
      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(
        { search: update.search, hash: location.hash },
        { replace: true, state: location.state },
      );
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [urlDashboardFilterSearch, isPageLayoutInEditMode, pageLayoutId]);

  return null;
};
