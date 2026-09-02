import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { isWorkspaceLocationAvailableOnSurface } from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useStore } from 'jotai';
import { type ReactNode, useContext, useMemo } from 'react';
import {
  createPath,
  type NavigateOptions,
  type Navigator,
  type To,
  UNSAFE_NavigationContext,
} from 'react-router-dom';

const getPathFromTo = (to: To) =>
  typeof to === 'string' ? to : createPath(to);

export const SidePanelRouteNavigatorProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const parentNavigationContext = useContext(UNSAFE_NavigationContext);
  const parentNavigator = parentNavigationContext.navigator;
  const routeObjects = useWorkspaceRouteObjects();
  const store = useStore();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openSettingsMenu } = useOpenSettingsMenu();
  const { goBackFromSidePanel, navigateSidePanelHistory } =
    useSidePanelHistory();

  const navigator = useMemo<Navigator>(() => {
    const navigate = (
      method: 'push' | 'replace',
      to: To,
      state?: unknown,
      options?: NavigateOptions,
    ) => {
      const shouldNavigateMain = options?.surface === 'main';
      const path = getPathFromTo(to);

      if (
        !shouldNavigateMain &&
        isWorkspaceLocationAvailableOnSurface(routeObjects, 'side-panel', path)
      ) {
        const currentNavigationItem = store
          .get(sidePanelNavigationStackState.atom)
          .at(-1);

        openRoutedPageInSidePanel({
          path,
          state,
          replaceCurrent: method === 'replace',
          routedFlowStateScopeId:
            currentNavigationItem?.routedFlowStateScopeId ??
            currentNavigationItem?.pageId,
        });
        return;
      }

      void closeSidePanelMenu();
      if (path.startsWith('/settings')) {
        openSettingsMenu();
      }
      parentNavigator[method](to, state, options);
    };

    return {
      ...parentNavigator,
      push: (to, state, options) => navigate('push', to, state, options),
      replace: (to, state, options) => navigate('replace', to, state, options),
      go: (delta) => {
        if (delta === -1) {
          goBackFromSidePanel();
          return;
        }

        if (delta >= 0) {
          void closeSidePanelMenu();
          parentNavigator.go(delta);
          return;
        }

        const navigationStack = store.get(sidePanelNavigationStackState.atom);
        const targetIndex = navigationStack.length - 1 + delta;

        if (targetIndex < 0) {
          void closeSidePanelMenu();
          return;
        }

        navigateSidePanelHistory(targetIndex);
      },
    };
  }, [
    closeSidePanelMenu,
    goBackFromSidePanel,
    navigateSidePanelHistory,
    openRoutedPageInSidePanel,
    openSettingsMenu,
    parentNavigator,
    routeObjects,
    store,
  ]);

  const navigationContextValue = useMemo(
    () => ({ ...parentNavigationContext, navigator }),
    [navigator, parentNavigationContext],
  );

  return (
    <UNSAFE_NavigationContext.Provider value={navigationContextValue}>
      {children}
    </UNSAFE_NavigationContext.Provider>
  );
};
