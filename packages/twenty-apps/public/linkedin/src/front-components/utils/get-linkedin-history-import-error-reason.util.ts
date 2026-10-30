import { t } from 'twenty-sdk/front-component';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const getLinkedinHistoryImportErrorReason = (
  error: LinkedinHistoryImportState['error'],
): string => {
  switch (error?.code) {
    case 'AUTH_FAILED':
      return t(
        'LinkedIn signed you out. Reconnect your account in the General tab, then retry.',
      );
    case 'UNREACHABLE':
      return t('LinkedIn could not be reached. Retry in a few minutes.');
    default:
      return error?.message ?? t('Retry to continue from the start.');
  }
};
