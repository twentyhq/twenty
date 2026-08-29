import { matchSidePanelHostableRoute } from '@/side-panel/routing/utils/matchSidePanelHostableRoute';
import { isDefined } from 'twenty-shared/utils';

export const isSidePanelHostablePath = (path: string) =>
  isDefined(matchSidePanelHostableRoute(path));
