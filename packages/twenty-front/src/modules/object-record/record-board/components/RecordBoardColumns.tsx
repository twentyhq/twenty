import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { canAddRecordGroupForFieldMetadataItem } from '@/object-record/record-group/utils/canAddRecordGroupForFieldMetadataItem';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledColumnContainer = styled.div`
  display: flex;
  flex: 1;

  & > *:not(:first-of-type) {
    border-left: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledAddGroupColumnDivider = styled.div`
  width: 0;
`;

export const RecordBoardColumns = () => {
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  const shouldShowAddGroupColumnDivider = canAddRecordGroupForFieldMetadataItem(
    selectFieldMetadataItem,
  );

  return (
    <StyledColumnContainer>
      {visibleRecordGroupIds.map((recordGroupId, index) => {
        return (
          <RecordBoardColumn
            key={recordGroupId}
            recordBoardColumnId={recordGroupId}
            recordBoardColumnIndex={index}
          />
        );
      })}
      {shouldShowAddGroupColumnDivider && <StyledAddGroupColumnDivider />}
    </StyledColumnContainer>
  );
};
