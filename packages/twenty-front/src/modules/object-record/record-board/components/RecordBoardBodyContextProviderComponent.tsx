import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { ReactNode, useContext } from 'react';
import { RecordBoardBodyContextProvider } from '../contexts/RecordBoardBodyContext';
import { useUpsertBoardRecord } from '../hooks/useUpsertBoardRecord';

type RecordBoardBodyContextProviderComponentProps = {
  children: ReactNode;
  columnId: string;
};

export const RecordBoardBodyContextProviderComponent = ({
  children,
  columnId,
}: RecordBoardBodyContextProviderComponentProps) => {
  const { upsertBoardRecord } = useUpsertBoardRecord(columnId);
  const { closeInlineCell } = useInlineCell();

  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const handleUpsertBoardRecord = ({
    recordId,
    fieldName,
    persistField,
  }: {
    recordId: string;
    fieldName: string;
    persistField: () => void;
  }) => {
    upsertBoardRecord(
      persistField,
      recordId,
      fieldName,
      columnDefinition?.value ?? '',
    );
  };

  return (
    <RecordBoardBodyContextProvider
      value={{
        columnId,
        onUpsertRecord: handleUpsertBoardRecord,
        onCloseInlineCell: closeInlineCell,
      }}
    >
      {children}
    </RecordBoardBodyContextProvider>
  );
};
