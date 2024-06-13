import { useRecoilCallback } from 'recoil';

import { isNavigationSectionOpenComponentState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useNavigationSection = () => {
  const closeNavigationSection = useRecoilCallback(
    ({ set }) =>
      (componentId: string) => {
        set(
          isNavigationSectionOpenComponentState({
            scopeId: componentId,
          }),
          false,
        );
      },
    [],
  );

  const openNavigationSection = useRecoilCallback(
    ({ set }) =>
      (componentId: string) => {
        set(
          isNavigationSectionOpenComponentState({
            scopeId: componentId,
          }),
          true,
        );
      },
    [],
  );

  const toggleNavigationSection = useRecoilCallback(
    ({ snapshot }) =>
      (componentId: string) => {
        console.log('componentId', componentId);
        const isNavigationSectionOpen = snapshot
          .getLoadable(
            isNavigationSectionOpenComponentState({ scopeId: componentId }),
          )
          .getValue();

        console.log(isNavigationSectionOpen);

        if (isNavigationSectionOpen) {
          closeNavigationSection(componentId);
        } else {
          openNavigationSection(componentId);
        }
      },
    [closeNavigationSection, openNavigationSection],
  );

  return {
    isNavigationSectionOpenState: (scopeId: string) =>
      extractComponentState(isNavigationSectionOpenComponentState, scopeId),
    closeNavigationSection,
    openNavigationSection,
    toggleNavigationSection,
  };
};
