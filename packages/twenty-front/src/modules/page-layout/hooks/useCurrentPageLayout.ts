import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const useCurrentPageLayout = () => {
  const pageLayoutPersisted = useRecoilComponentValueV2(
    pageLayoutPersistedComponentState,
  );

  const pageLayoutDraft = useRecoilComponentValueV2(
    pageLayoutDraftComponentState,
  );

  const isPageLayoutInEditMode = useRecoilComponentValueV2(
    isPageLayoutInEditModeComponentState,
  );

  const currentPageLayout = isPageLayoutInEditMode
    ? pageLayoutDraft
    : pageLayoutPersisted;

  return { currentPageLayout };
};
