import { useUpsertBoardRecord } from '@/object-record/record-board/hooks/useUpsertBoardRecord';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

type RecordBoardColumnContextProviderProps = {
  children: ReactNode;
  recordBoardColumnId: string;
};

export const RecordBoardColumnContextProvider = ({
  children,
  recordBoardColumnId,
}: RecordBoardColumnContextProviderProps) => {
  const recordGroupDefinition = useRecoilValue(
    recordGroupDefinitionFamilyState(recordBoardColumnId),
  );

  const recordIdsByGroup = useRecoilComponentFamilyValueV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );
  const { upsertBoardRecord } = useUpsertBoardRecord(recordBoardColumnId);
  const { closeInlineCell } = useInlineCell();

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
      recordGroupDefinition?.value ?? '',
    );
  };
  if (!recordGroupDefinition) {
    return null;
  }

  return (
    <RecordBoardColumnContext
      value={{
        columnId: recordBoardColumnId,
        columnDefinition: recordGroupDefinition,
        recordCount: recordIdsByGroup.length,
        recordIds: recordIdsByGroup,
        onUpsertRecord: handleUpsertBoardRecord,
        onCloseInlineCell: closeInlineCell,
      }}
    >
      {children}
    </RecordBoardColumnContext>
  );
};
