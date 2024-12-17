import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import { visibleRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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
  const visibleRecordGroupIds = useRecoilComponentValueV2(
    visibleRecordGroupIdsComponentSelector,
  );

  return (
    <StyledHeaderContainer id="record-board-header">
      {visibleRecordGroupIds.map((recordGroupId) => (
        <RecordBoardColumnHeaderWrapper
          columnId={recordGroupId}
          key={recordGroupId}
        />
      ))}
    </StyledHeaderContainer>
  );
};
