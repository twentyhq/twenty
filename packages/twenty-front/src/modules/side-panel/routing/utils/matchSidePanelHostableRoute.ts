import { matchPath } from 'react-router-dom';

import { SIDE_PANEL_HOSTABLE_ROUTES } from '@/side-panel/routing/constants/SidePanelHostableRoutes';
import { type SidePanelHostableRoute } from '@/side-panel/routing/types/SidePanelHostableRoute';

export const matchSidePanelHostableRoute = (
  path: string,
): SidePanelHostableRoute | undefined => {
  const pathnameWithoutSearch = path.split('?')[0].split('#')[0];

  return SIDE_PANEL_HOSTABLE_ROUTES.find((hostableRoute) =>
    matchPath(hostableRoute.path, pathnameWithoutSearch),
  );
};
