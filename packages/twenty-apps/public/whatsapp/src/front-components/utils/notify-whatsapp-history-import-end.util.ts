import { enqueueSnackbar, t } from 'twenty-sdk/front-component';

import { getWhatsappHistoryImportErrorReason } from 'src/front-components/utils/get-whatsapp-history-import-error-reason.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export const notifyWhatsappHistoryImportEnd = ({
  previous,
  next,
}: {
  previous: WhatsappHistoryImportState | null;
  next: WhatsappHistoryImportState | null;
}): void => {
  if (previous?.status !== 'IMPORTING' || previous.runId !== next?.runId) {
    return;
  }

  if (next.status === 'COMPLETED') {
    enqueueSnackbar({
      message: t('{count} past conversations imported', {
        count: next.importedConversationCount,
      }),
      variant: 'success',
    });
  }

  if (next.status === 'FAILED') {
    enqueueSnackbar({
      message: t('WhatsApp import failed. {reason}', {
        reason: getWhatsappHistoryImportErrorReason(next.error),
      }),
      variant: 'error',
    });
  }
};
