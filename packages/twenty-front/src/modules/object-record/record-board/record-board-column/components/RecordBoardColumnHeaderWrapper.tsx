import { RecordBoardColumnHeader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeader';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

type RecordBoardColumnHeaderWrapperProps = {
  columnId: string;
  columnIndex: number;
};

export const RecordBoardColumnHeaderWrapper = ({
  columnId,
  columnIndex,
}: RecordBoardColumnHeaderWrapperProps) => {
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    columnId,
  );

  const recordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    columnId,
  );

  const shouldHide = useShouldHideRecordGroup(columnId);

  if (shouldHide) {
    return null;
  }

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnId,
        columnDefinition: recordGroupDefinition,
        recordIds: recordIdsByGroup,
        columnIndex,
      }}
    >
      <RecordBoardColumnHeader />
    </RecordBoardColumnContext.Provider>
  );
};
