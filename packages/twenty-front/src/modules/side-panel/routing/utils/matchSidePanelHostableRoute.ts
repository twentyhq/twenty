import { matchPath, parsePath, type PathMatch } from 'react-router-dom';

import { SIDE_PANEL_HOSTABLE_ROUTES } from '@/side-panel/routing/constants/SidePanelHostableRoutes';
import { type SidePanelHostableRoute } from '@/side-panel/routing/types/SidePanelHostableRoute';

export type SidePanelHostableRouteMatch = {
  route: SidePanelHostableRoute;
  match: PathMatch<string>;
};

export const matchSidePanelHostableRoute = (
  path: string,
): SidePanelHostableRouteMatch | undefined => {
  const pathname = parsePath(path).pathname ?? '';

  for (const route of SIDE_PANEL_HOSTABLE_ROUTES) {
    const match = matchPath(route.path, pathname);

    if (match !== null) {
      return { route, match };
    }
  }

  return undefined;
};
