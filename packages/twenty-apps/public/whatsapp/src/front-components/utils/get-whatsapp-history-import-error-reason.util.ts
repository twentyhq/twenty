import { t } from 'twenty-sdk/front-component';

import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export const getWhatsappHistoryImportErrorReason = (
  error: WhatsappHistoryImportState['error'],
): string => {
  switch (error?.code) {
    case 'AUTH_FAILED':
      return t(
        'This connection was unlinked from your phone. Reconnect your account in the General tab, then retry.',
      );
    case 'STALLED':
      return t('It stopped responding. Retry to start it again.');
    case 'UNREACHABLE':
      return t('WhatsApp could not be reached. Retry in a few minutes.');
    default:
      return error?.message ?? t('Retry to continue from the start.');
  }
};
