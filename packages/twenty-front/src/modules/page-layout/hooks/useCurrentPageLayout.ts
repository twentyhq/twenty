import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useCurrentPageLayout = () => {
  const pageLayoutPersisted = useRecoilComponentValue(
    pageLayoutPersistedComponentState,
  );

  const pageLayoutDraft = useRecoilComponentValue(
    pageLayoutDraftComponentState,
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const currentPageLayout = isPageLayoutInEditMode
    ? pageLayoutDraft
    : pageLayoutPersisted;

  return { currentPageLayout };
};
