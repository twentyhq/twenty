import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyString } from '@sniptt/guards';

export const useCurrentPageLayout = () => {
  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
  );

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
  );

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const isDraftInitialized = isNonEmptyString(pageLayoutDraft.id);

  const currentPageLayout = isPageLayoutInEditMode
    ? isDraftInitialized
      ? pageLayoutDraft
      : pageLayoutPersisted
    : pageLayoutPersisted;

  return { currentPageLayout };
};
