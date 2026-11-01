import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableRowContextValue = {
  pathToShowPage: string;
  objectNameSingular: string;
  recordId: string;
  isSelected: boolean;
  isRecordReadOnly?: boolean;
  restrictedFieldNames: string[];
};

export const [RecordTableRowContextProvider, useRecordTableRowContextOrThrow] =
  createRequiredContext<RecordTableRowContextValue>('RecordTableRowContext');
