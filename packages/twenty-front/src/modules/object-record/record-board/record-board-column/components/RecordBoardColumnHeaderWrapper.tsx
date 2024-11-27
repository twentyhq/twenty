import { isDefined } from 'twenty-ui';

import { RecordBoardColumnHeader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeader';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRowIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRowIdsByGroupComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilValue } from 'recoil';

type RecordBoardColumnHeaderWrapperProps = {
  columnId: string;
};

export const RecordBoardColumnHeaderWrapper = ({
  columnId,
}: RecordBoardColumnHeaderWrapperProps) => {
  const recordGroupDefinition = useRecoilValue(
    recordGroupDefinitionFamilyState(columnId),
  );

  const recordRowIdsByGroup = useRecoilComponentFamilyValueV2(
    recordIndexRowIdsByGroupComponentFamilyState,
    columnId,
  );

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnId,
        columnDefinition: recordGroupDefinition,
        recordCount: recordRowIdsByGroup.length,
        recordIds: recordRowIdsByGroup,
      }}
    >
      <RecordBoardColumnHeader />
    </RecordBoardColumnContext.Provider>
  );
};
