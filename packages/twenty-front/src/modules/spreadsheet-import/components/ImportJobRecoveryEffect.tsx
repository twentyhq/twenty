import {
  useImportJobPoller,
  useImportJobRecovery,
} from '@/spreadsheet-import/hooks/useImportJobProgress';

export const ImportJobRecoveryEffect = () => {
  useImportJobRecovery();
  useImportJobPoller();

  return null;
};
