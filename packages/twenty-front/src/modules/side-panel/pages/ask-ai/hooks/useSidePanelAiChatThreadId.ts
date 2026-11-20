import { useAtomValue } from 'jotai';
import { matchPath } from 'react-router-dom';
import {
  AppPath,
  SidePanelPages,
  StandardObjectNameSingular,
} from 'twenty-shared/types';

import { askAiSidePanelThreadIdComponentState } from '@/side-panel/pages/ask-ai/states/askAiSidePanelThreadIdComponentState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSidePanelAiChatThreadId = () => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const currentSidePanelItem = sidePanelNavigationStack.at(-1);
  const askAiSidePanelThreadId = useAtomValue(
    askAiSidePanelThreadIdComponentState.atomFamily({
      instanceId: currentSidePanelItem?.pageId ?? '',
    }),
  );

  if (!isSidePanelOpened) {
    return undefined;
  }

  if (currentSidePanelItem?.page === SidePanelPages.AskAI) {
    return askAiSidePanelThreadId ?? undefined;
  }

  if (currentSidePanelItem?.page !== SidePanelPages.RoutedPage) {
    return undefined;
  }

  const recordShowParams = matchPath(
    AppPath.RecordShowPage,
    currentSidePanelItem.routedLocation.pathname,
  )?.params;

  return recordShowParams?.objectNameSingular ===
    StandardObjectNameSingular.AgentChatThread
    ? recordShowParams.objectRecordId
    : undefined;
};
