import { useRecoilCallback } from 'recoil';

import { isNavigationSectionOpenFamilytState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenComponentState';

export const useNavigationSection = (scopeId: string) => {
  const closeNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isNavigationSectionOpenFamilytState(scopeId), false);
      },
    [scopeId],
  );

  const openNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isNavigationSectionOpenFamilytState(scopeId), true);
      },
    [scopeId],
  );

  const toggleNavigationSection = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isNavigationSectionOpen = snapshot
          .getLoadable(isNavigationSectionOpenFamilytState(scopeId))
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
    isNavigationSectionOpenFamilytState(scopeId);

  return {
    isNavigationSectionOpenState,
    closeNavigationSection,
    openNavigationSection,
    toggleNavigationSection,
  };
};
