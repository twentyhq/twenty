import { isObject } from '@sniptt/guards';

import { getCurrentHistoryEntryState } from '~/utils/getCurrentHistoryEntryState';

export const isAiChatHandoffSkipped = () => {
  const historyEntryState = getCurrentHistoryEntryState();

  return (
    isObject(historyEntryState) &&
    'isAiChatHandoffSkipped' in historyEntryState &&
    historyEntryState.isAiChatHandoffSkipped === true
  );
};
