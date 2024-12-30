import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordBoardBodyContextProps = {
  columnId?: string;
  onUpsertRecord: ({
    recordId,
    fieldName,
    persistField,
  }: {
    recordId: string;
    fieldName: string;
    persistField: () => void;
  }) => void;
  onCloseInlineCell: () => void;
};

export const [
  RecordBoardBodyContextProvider,
  useRecordBoardBodyContextOrThrow,
] = createRequiredContext<RecordBoardBodyContextProps>(
  'RecordBoardBodyContext',
);
