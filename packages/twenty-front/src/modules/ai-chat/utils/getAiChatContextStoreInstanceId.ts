import { isDefined } from 'twenty-shared/utils';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

// On the full page chat the side panel holds what the user is looking at, so it owns the context.
export const getAiChatContextStoreInstanceId = ({
  isOnAiChatPage,
  isSidePanelOpened,
  currentSidePanelPageId,
}: {
  isOnAiChatPage: boolean;
  isSidePanelOpened: boolean;
  currentSidePanelPageId: string | undefined;
}): string =>
  isOnAiChatPage && isSidePanelOpened && isDefined(currentSidePanelPageId)
    ? currentSidePanelPageId
    : MAIN_CONTEXT_STORE_INSTANCE_ID;
