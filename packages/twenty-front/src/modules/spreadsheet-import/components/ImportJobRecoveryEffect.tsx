import { useImportJobRecovery } from '@/spreadsheet-import/hooks/useImportJobProgress';

export const ImportJobRecoveryEffect = () => {
  useImportJobRecovery();

  return null;
};
