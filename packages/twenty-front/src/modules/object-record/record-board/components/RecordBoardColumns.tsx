import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { ViewType } from '@/views/types/ViewType';
import styled from '@emotion/styled';

const StyledColumnContainer = styled.div`
  display: flex;

  & > *:not(:first-of-type) {
    border-left: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

export const RecordBoardColumns = () => {
  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
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
    </StyledColumnContainer>
  );
};
