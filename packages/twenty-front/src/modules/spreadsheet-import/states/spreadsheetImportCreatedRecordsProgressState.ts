import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const spreadsheetImportCreatedRecordsProgressState = createStateV2({
  key: 'spreadsheetImportCreatedRecordsProgressState',
  defaultValue: 0,
});
