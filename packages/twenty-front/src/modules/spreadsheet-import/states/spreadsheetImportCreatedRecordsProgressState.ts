import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const spreadsheetImportCreatedRecordsProgressState = createAtomState({
  key: 'spreadsheetImportCreatedRecordsProgressState',
  defaultValue: 0,
});
