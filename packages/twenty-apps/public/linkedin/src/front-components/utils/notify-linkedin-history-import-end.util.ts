import { enqueueSnackbar, t } from 'twenty-sdk/front-component';

import { getLinkedinHistoryImportErrorReason } from 'src/front-components/utils/get-linkedin-history-import-error-reason.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

// Only a run this page saw going reports its end, so reopening the page stays quiet
export const notifyLinkedinHistoryImportEnd = ({
  previous,
  next,
}: {
  previous: LinkedinHistoryImportState | null;
  next: LinkedinHistoryImportState | null;
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
      message: t('LinkedIn import failed. {reason}', {
        reason: getLinkedinHistoryImportErrorReason(next.error),
      }),
      variant: 'error',
    });
  }
};
