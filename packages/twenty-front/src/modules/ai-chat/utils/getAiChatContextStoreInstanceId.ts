import { isDefined } from 'twenty-shared/utils';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

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
