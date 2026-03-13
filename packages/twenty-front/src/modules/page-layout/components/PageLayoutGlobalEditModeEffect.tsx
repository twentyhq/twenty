import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { touchedPageLayoutIdsState } from '@/app/states/touchedPageLayoutIdsState';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';

type PageLayoutGlobalEditModeEffectProps = {
  pageLayoutId: string;
};

export const PageLayoutGlobalEditModeEffect = ({
  pageLayoutId,
}: PageLayoutGlobalEditModeEffectProps) => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );
  const store = useStore();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  // No cleanup function — touchedPageLayoutIds intentionally accumulates IDs
  // across page navigations during a customization session. The save/cancel
  // hooks iterate the full set to persist or revert all touched layouts.
  useEffect(() => {
    if (!isLayoutCustomizationActive) {
      return;
    }

    const touchedIds = store.get(touchedPageLayoutIdsState.atom);
    const isAlreadyTouched = touchedIds.has(pageLayoutId);

    if (!isAlreadyTouched) {
      // First visit: use setIsPageLayoutInEditMode which clears field widget drafts
      setIsPageLayoutInEditMode(true);
      store.set(
        touchedPageLayoutIdsState.atom,
        new Set([...touchedIds, pageLayoutId]),
      );
    } else {
      // Return visit: set edit mode directly to preserve existing drafts
      store.set(
        isPageLayoutInEditModeComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        true,
      );
      store.set(currentPageLayoutIdState.atom, pageLayoutId);
    }
  }, [
    isLayoutCustomizationActive,
    pageLayoutId,
    setIsPageLayoutInEditMode,
    store,
  ]);

  return null;
};
