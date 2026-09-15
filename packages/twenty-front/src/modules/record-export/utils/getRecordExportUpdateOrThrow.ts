import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  RecordExportStatus,
  type ExportRecordsSubscription,
} from '~/generated-metadata/graphql';

export const getRecordExportUpdateOrThrow = (
  recordExport: ExportRecordsSubscription['exportRecords'],
): { progress: number; download?: { url: string; filename: string } } => {
  if (recordExport.status === RecordExportStatus.FAILED) {
    throw new Error(
      recordExport.errorMessage ?? t`The export failed. Please try again.`,
    );
  }
  if (recordExport.status === RecordExportStatus.COMPLETED) {
    if (!isDefined(recordExport.downloadUrl)) {
      throw new Error(t`The export could not be downloaded. Please try again.`);
    }
    return {
      progress: 100,
      download: {
        url: recordExport.downloadUrl,
        filename: recordExport.filename,
      },
    };
  }
  const total = recordExport.totalRecordCount;
  return {
    progress:
      isDefined(total) && total > 0
        ? Math.min(
            99,
            Math.round((recordExport.processedRecordCount / total) * 100),
          )
        : 0,
  };
};
