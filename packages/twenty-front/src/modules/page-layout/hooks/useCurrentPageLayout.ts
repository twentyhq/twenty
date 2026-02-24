import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useCurrentPageLayout = () => {
  const pageLayoutPersisted = useAtomComponentValue(
    pageLayoutPersistedComponentState,
  );

  const pageLayoutDraft = useAtomComponentValue(pageLayoutDraftComponentState);

  const isPageLayoutInEditMode = useAtomComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const currentPageLayout = isPageLayoutInEditMode
    ? pageLayoutDraft
    : pageLayoutPersisted;

  return { currentPageLayout };
};
