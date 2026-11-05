import { matchPath } from 'react-router-dom';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';

export const isSidePanelItemShowingAiChat = ({
  sidePanelItem,
  chatObjectNameSingular,
}: {
  sidePanelItem: SidePanelNavigationStackItem | undefined;
  chatObjectNameSingular?: string;
}): boolean => {
  if (!isDefined(sidePanelItem)) {
    return false;
  }

  if (sidePanelItem.page === SidePanelPages.AskAI) {
    return true;
  }

  return (
    sidePanelItem.page === SidePanelPages.RoutedPage &&
    isNonEmptyString(chatObjectNameSingular) &&
    matchPath(AppPath.RecordShowPage, sidePanelItem.routedLocation.pathname)
      ?.params.objectNameSingular === chatObjectNameSingular
  );
};
