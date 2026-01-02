import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { filteredVisibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/filteredVisibleRecordGroupIdsComponentFamilySelector';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
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
    filteredVisibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  return (
    <StyledHeaderContainer id="record-board-header">
      {visibleRecordGroupIds.map((recordGroupId, index) => (
        <RecordGroupContext.Provider
          key={recordGroupId}
          value={{ recordGroupId }}
        >
          <RecordBoardColumnHeaderWrapper
            columnId={recordGroupId}
            columnIndex={index}
          />
        </RecordGroupContext.Provider>
      ))}
      <RecordIndexGroupAggregatesDataLoader />
    </StyledHeaderContainer>
  );
};
