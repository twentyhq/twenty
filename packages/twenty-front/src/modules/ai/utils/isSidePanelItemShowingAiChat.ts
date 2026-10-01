import { matchPath } from 'react-router-dom';
import {
  AppPath,
  CoreObjectNameSingular,
  SidePanelPages,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';

export const isSidePanelItemShowingAiChat = (
  sidePanelItem: SidePanelNavigationStackItem | undefined,
): boolean => {
  if (!isDefined(sidePanelItem)) {
    return false;
  }

  if (sidePanelItem.page === SidePanelPages.AskAI) {
    return true;
  }

  return (
    sidePanelItem.page === SidePanelPages.RoutedPage &&
    matchPath(AppPath.RecordShowPage, sidePanelItem.routedLocation.pathname)
      ?.params.objectNameSingular === CoreObjectNameSingular.AgentChatThread
  );
};
