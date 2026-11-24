import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export const getWhatsappSyncProgress = ({
  processedConversationCount,
  totalConversationCount,
}: Pick<
  WhatsappHistoryImportState,
  'processedConversationCount' | 'totalConversationCount'
>): number | undefined => {
  if (!isDefined(totalConversationCount) || totalConversationCount <= 0) {
    return undefined;
  }

  return Math.min(
    99,
    Math.floor((processedConversationCount / totalConversationCount) * 100),
  );
};
