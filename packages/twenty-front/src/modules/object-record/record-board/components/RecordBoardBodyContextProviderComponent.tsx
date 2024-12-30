import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useTriggerActionMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerActionMenuDropdown';
import { ReactNode } from 'react';
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
  const { triggerActionMenuDropdown } = useTriggerActionMenuDropdown({
    recordTableId: columnId,
  });

  const handleUpsertBoardRecord = ({
    persistField,
    recordId,
    fieldName,
  }: {
    persistField: () => void;
    recordId: string;
    fieldName: string;
  }) => {
    upsertBoardRecord(persistField, recordId, fieldName);
  };

  const handleActionMenuDropdown = (
    event: React.MouseEvent,
    recordId: string,
  ) => {
    triggerActionMenuDropdown(event, recordId);
  };

  return (
    <RecordBoardBodyContextProvider
      value={{
        columnId,
        onUpsertRecord: handleUpsertBoardRecord,
        onCloseInlineCell: closeInlineCell,
        onActionMenuDropdownOpened: handleActionMenuDropdown,
      }}
    >
      {children}
    </RecordBoardBodyContextProvider>
  );
};
