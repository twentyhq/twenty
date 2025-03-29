import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordTableRowContextValue = {
  pathToShowPage: string;
  objectNameSingular: string;
  recordId: string;
  rowIndex: number;
  isSelected: boolean;
  inView: boolean;
  isPendingRow?: boolean;
  isReadOnly?: boolean;
};

export const [RecordTableRowContextProvider, useRecordTableRowContextOrThrow] =
  createRequiredContext<RecordTableRowContextValue>('RecordTableRowContext');
