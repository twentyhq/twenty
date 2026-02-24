import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const spreadsheetImportCreatedRecordsProgressState = createState({
  key: 'spreadsheetImportCreatedRecordsProgressState',
  defaultValue: 0,
});
