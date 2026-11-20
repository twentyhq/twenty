import { useAtomValue } from 'jotai';
import {
  SidePanelPages,
  StandardObjectNameSingular,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { askAiSidePanelThreadIdComponentState } from '@/side-panel/states/askAiSidePanelThreadIdComponentState';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { getRecordShowParamsFromPath } from '@/side-panel/routing/utils/getRecordShowParamsFromPath';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSidePanelAiChatThreadId = () => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const currentSidePanelItem = useAtomStateValue(
    sidePanelNavigationStackState,
  ).at(-1);
  const askAiSidePanelThreadId = useAtomValue(
    askAiSidePanelThreadIdComponentState.atomFamily({
      instanceId: currentSidePanelItem?.pageId ?? '',
    }),
  );
  const sidePanelRoutedPath = useCurrentSidePanelRoutedPath();
  const sidePanelRecord = isDefined(sidePanelRoutedPath)
    ? getRecordShowParamsFromPath(sidePanelRoutedPath)
    : null;

  if (!isSidePanelOpened) {
    return undefined;
  }

  if (currentSidePanelItem?.page === SidePanelPages.AskAI) {
    return askAiSidePanelThreadId ?? undefined;
  }

  return sidePanelRecord?.objectNameSingular ===
    StandardObjectNameSingular.AgentChatThread
    ? sidePanelRecord.objectRecordId
    : undefined;
};
