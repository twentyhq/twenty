import {
  useExportJobPoller,
  useExportJobRecovery,
} from '@/object-record/record-index/export/hooks/useExportJobProgress';

export const ExportJobRecoveryEffect = () => {
  useExportJobRecovery();
  useExportJobPoller();

  return null;
};
