import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Status } from 'twenty-ui/primitives/data-display';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

type LinkedinHistoryImportStatusProps = {
  historyImport: LinkedinHistoryImportState | null;
  progress: number | undefined;
};

export const LinkedinHistoryImportStatus = ({
  historyImport,
  progress,
}: LinkedinHistoryImportStatusProps) => {
  if (historyImport?.status === 'FAILED') {
    return (
      <Status color="red" weight="medium">
        {t('Import failed')}
      </Status>
    );
  }

  if (historyImport?.status !== 'IMPORTING') {
    return null;
  }

  return (
    <Status color="turquoise" weight="medium" loading aria-live="polite">
      {isDefined(progress)
        ? t('Importing {progress}%', { progress })
        : t('Importing')}
    </Status>
  );
};
