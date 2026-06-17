import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonCardContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow:
    0px 4px 8px 0px ${themeCssVariables.color.gray2},
    0px 0px 4px 0px ${themeCssVariables.color.gray2};
  color: ${themeCssVariables.font.color.primary};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const RecordBoardColumnLoadingSkeletonCards = () => {
  return Array.from(
    {
      length: RECORD_BOARD_QUERY_PAGE_SIZE,
    },
    (_, index) => (
      <StyledSkeletonCardContainer key={`${index}`}>
        <RecordBoardColumnCardContainerSkeletonLoader />
      </StyledSkeletonCardContainer>
    ),
  );
};
