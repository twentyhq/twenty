import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { ViewType } from '@/views/types/ViewType';
import styled from '@emotion/styled';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  z-index: 10;

  overflow: visible;
  width: 100%;

  &.header-sticky {
    position: sticky;
    top: 0;
  }

  & > *:not(:first-of-type) {
    border-left: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

export const RecordBoardHeader = () => {
  const visibleRecordGroupIds = useRecoilComponentFamilyValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  return (
    <StyledHeaderContainer id="record-board-header">
      {visibleRecordGroupIds.map((recordGroupId, index) => (
        <RecordBoardColumnHeaderWrapper
          columnId={recordGroupId}
          columnIndex={index}
          key={recordGroupId}
        />
      ))}
    </StyledHeaderContainer>
  );
};
