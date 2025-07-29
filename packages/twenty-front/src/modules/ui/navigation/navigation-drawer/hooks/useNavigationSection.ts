import { useRecoilCallback } from 'recoil';

import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

export const useNavigationSection = (navigationSectionId: string) => {
  const closeNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isNavigationSectionOpenFamilyState(navigationSectionId), false);
      },
    [navigationSectionId],
  );

  const openNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isNavigationSectionOpenFamilyState(navigationSectionId), true);
      },
    [navigationSectionId],
  );

  const toggleNavigationSection = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isNavigationSectionOpen = snapshot
          .getLoadable(isNavigationSectionOpenFamilyState(navigationSectionId))
          .getValue();

        if (isNavigationSectionOpen) {
          closeNavigationSection();
        } else {
          openNavigationSection();
        }
      },
    [closeNavigationSection, openNavigationSection, navigationSectionId],
  );

  const isNavigationSectionOpenState =
    isNavigationSectionOpenFamilyState(navigationSectionId);

  return {
    isNavigationSectionOpenState,
    closeNavigationSection,
    openNavigationSection,
    toggleNavigationSection,
  };
};
