import { useRecoilCallback } from 'recoil';

import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

export const useNavigationSection = (scopeId: string) => {
  const closeNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isNavigationSectionOpenFamilyState(scopeId), false);
      },
    [scopeId],
  );

  const openNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isNavigationSectionOpenFamilyState(scopeId), true);
      },
    [scopeId],
  );

  const toggleNavigationSection = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isNavigationSectionOpen = snapshot
          .getLoadable(isNavigationSectionOpenFamilyState(scopeId))
          .getValue();

        if (isNavigationSectionOpen) {
          closeNavigationSection();
        } else {
          openNavigationSection();
        }
      },
    [closeNavigationSection, openNavigationSection, scopeId],
  );

  const isNavigationSectionOpenState =
    isNavigationSectionOpenFamilyState(scopeId);

  return {
    isNavigationSectionOpenState,
    closeNavigationSection,
    openNavigationSection,
    toggleNavigationSection,
  };
};
