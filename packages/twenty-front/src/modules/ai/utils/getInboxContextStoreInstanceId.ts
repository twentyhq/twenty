import { isDefined } from 'twenty-shared/utils';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

// On the full page chat the side panel holds what the user is looking at, so it owns the context.
export const getInboxContextStoreInstanceId = ({
  isOnInboxThreadPage,
  isSidePanelOpened,
  currentSidePanelPageId,
}: {
  isOnInboxThreadPage: boolean;
  isSidePanelOpened: boolean;
  currentSidePanelPageId: string | undefined;
}): string =>
  isOnInboxThreadPage && isSidePanelOpened && isDefined(currentSidePanelPageId)
    ? currentSidePanelPageId
    : MAIN_CONTEXT_STORE_INSTANCE_ID;
