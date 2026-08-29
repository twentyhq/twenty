import { matchPath } from 'react-router-dom';

import { SIDE_PANEL_HOSTABLE_ROUTES } from '@/side-panel/routing/constants/SidePanelHostableRoutes';
import { getPathnameFromPath } from '@/side-panel/routing/utils/getPathnameFromPath';
import { type SidePanelHostableRoute } from '@/side-panel/routing/types/SidePanelHostableRoute';

export const matchSidePanelHostableRoute = (
  path: string,
): SidePanelHostableRoute | undefined => {
  const pathname = getPathnameFromPath(path);

  return SIDE_PANEL_HOSTABLE_ROUTES.find((hostableRoute) =>
    matchPath(hostableRoute.path, pathname),
  );
};
