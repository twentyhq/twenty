import { useStore } from 'jotai';
import { useCallback } from 'react';

import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';

export const useNavigationSection = (navigationSectionId: string) => {
  const store = useStore();
  const isNavigationSectionOpen = useFamilyRecoilValueV2(
    isNavigationSectionOpenFamilyState,
    navigationSectionId,
  );

  const closeNavigationSection = useCallback(() => {
    store.set(
      isNavigationSectionOpenFamilyState.atomFamily(navigationSectionId),
      false,
    );
  }, [store, navigationSectionId]);

  const openNavigationSection = useCallback(() => {
    store.set(
      isNavigationSectionOpenFamilyState.atomFamily(navigationSectionId),
      true,
    );
  }, [store, navigationSectionId]);

  const toggleNavigationSection = useCallback(() => {
    if (isNavigationSectionOpen) {
      closeNavigationSection();
    } else {
      openNavigationSection();
    }
  }, [isNavigationSectionOpen, closeNavigationSection, openNavigationSection]);

  return {
    isNavigationSectionOpen,
    closeNavigationSection,
    openNavigationSection,
    toggleNavigationSection,
  };
};
