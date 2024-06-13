import { useRecoilCallback } from 'recoil';

import { isNavigationSectionOpenComponentState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useNavigationSection = (scopeId: string) => {
  const closeNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(
          isNavigationSectionOpenComponentState({
            scopeId,
          }),
          false,
        );
      },
    [scopeId],
  );

  const openNavigationSection = useRecoilCallback(
    ({ set }) =>
      () => {
        set(
          isNavigationSectionOpenComponentState({
            scopeId,
          }),
          true,
        );
      },
    [scopeId],
  );

  const toggleNavigationSection = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isNavigationSectionOpen = snapshot
          .getLoadable(isNavigationSectionOpenComponentState({ scopeId }))
          .getValue();

        if (isNavigationSectionOpen) {
          closeNavigationSection();
        } else {
          openNavigationSection();
        }
      },
    [closeNavigationSection, openNavigationSection, scopeId],
  );

  const isNavigationSectionOpenState = extractComponentState(
    isNavigationSectionOpenComponentState,
    scopeId,
  );

  return {
    isNavigationSectionOpenState,
    closeNavigationSection,
    openNavigationSection,
    toggleNavigationSection,
  };
};
