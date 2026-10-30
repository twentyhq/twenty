import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

// Undefined when LinkedIn did not give a total; capped so a run never shows 100% before it ends
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
