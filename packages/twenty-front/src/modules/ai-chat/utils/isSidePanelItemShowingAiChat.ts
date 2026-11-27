import { matchPath } from 'react-router-dom';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isInboxThreadObjectName } from '@/ai-chat/utils/isInboxThreadObjectName';
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
    isInboxThreadObjectName(
      matchPath(AppPath.RecordShowPage, sidePanelItem.routedLocation.pathname)
        ?.params.objectNameSingular,
    )
  );
};
