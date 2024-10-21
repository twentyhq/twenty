import { isDefined } from 'twenty-ui';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnHeader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeader';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useRecoilValue } from 'recoil';

type RecordBoardColumnHeaderWrapperProps = {
  columnId: string;
};

export const RecordBoardColumnHeaderWrapper = ({
  columnId,
}: RecordBoardColumnHeaderWrapperProps) => {
  const {
    columnsFamilySelector,
    recordIdsByColumnIdFamilyState,
  } = useRecordBoardStates();

  const columnDefinition = useRecoilValue(columnsFamilySelector(columnId));

  const recordIds = useRecoilValue(recordIdsByColumnIdFamilyState(columnId));

  if (!isDefined(columnDefinition)) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnId,
        columnDefinition: columnDefinition,
        recordCount: recordIds.length,
        recordIds,
      }}
    >
      <RecordBoardColumnHeader />
    </RecordBoardColumnContext.Provider>
  );
};
