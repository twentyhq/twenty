import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useNavigate } from 'react-router-dom';

import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { isWorkspaceLocationExpandableFromSidePanel } from '@/app/routing/utils/isWorkspaceLocationAvailableOnSurface';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';

// A route opts into generic expansion only when moving it between surface
// stores cannot discard in-progress state.
export const useExpandRoutedSidePanelPage =
  (): SidePanelExpandTarget | null => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const { closeSidePanelMenu } = useSidePanelMenu();
    const currentRoutedPath = useCurrentSidePanelRoutedPath();
    const routeObjects = useWorkspaceRouteObjects();

    if (
      !isDefined(currentRoutedPath) ||
      !isWorkspaceLocationExpandableFromSidePanel(
        routeObjects,
        currentRoutedPath,
      )
    ) {
      return null;
    }

    return {
      label: t`Open in full page`,
      expand: () => {
        void closeSidePanelMenu();
        navigate(currentRoutedPath, {
          surface: 'main',
        });
      },
      hasExpandShortcut: true,
    };
  };
