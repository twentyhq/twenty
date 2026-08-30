import { type getDefaultStore } from 'jotai';

import { type SidePanelRoutedPageInfo } from '@/side-panel/routing/types/SidePanelRoutedPageInfo';
import { type SidePanelHostableRouteMatch } from '@/side-panel/routing/utils/matchSidePanelHostableRoute';

// The panel top bar names every stack entry, including one reached by
// navigating inside a hosted page, where no caller is around to pass a title.
export const resolveSidePanelRoutedPageInfo = ({
  path,
  hostableRouteMatch,
  store,
}: {
  path: string;
  hostableRouteMatch: SidePanelHostableRouteMatch;
  store: ReturnType<typeof getDefaultStore>;
}): SidePanelRoutedPageInfo =>
  hostableRouteMatch.route.resolvePageInfo({
    match: hostableRouteMatch.match,
    path,
    store,
  });
