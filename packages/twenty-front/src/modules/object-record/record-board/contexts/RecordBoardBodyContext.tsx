import React from 'react';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordBoardBodyContextProps = {
  columnId?: string;
  onUpsertRecord: ({
    persistField,
    recordId,
    fieldName,
  }: {
    persistField: () => void;
    recordId: string;
    fieldName: string;
  }) => void;
  onCloseInlineCell: () => void;
  onActionMenuDropdownOpened: (
    event: React.MouseEvent,
    recordId: string,
  ) => void;
};

export const [
  RecordBoardBodyContextProvider,
  useRecordBoardBodyContextOrThrow,
] = createRequiredContext<RecordBoardBodyContextProps>(
  'RecordBoardBodyContext',
);
