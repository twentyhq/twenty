import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const getLinkedinSyncProgress = (
  historyImport: LinkedinHistoryImportState,
): number | undefined => {
  const { processedConversationCount, totalConversationCount } = historyImport;

  if (!isDefined(totalConversationCount) || totalConversationCount <= 0) {
    return undefined;
  }

  return Math.min(
    99,
    Math.floor((processedConversationCount / totalConversationCount) * 100),
  );
};
