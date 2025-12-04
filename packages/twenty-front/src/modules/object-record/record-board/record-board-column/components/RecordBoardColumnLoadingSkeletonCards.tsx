import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { RecordBoardColumnCardContainerSkeletonLoader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardContainerSkeletonLoader';
import styled from '@emotion/styled';

const StyledSkeletonCardContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow:
    0px 4px 8px 0px ${({ theme }) => theme.color.gray2},
    0px 0px 4px 0px ${({ theme }) => theme.color.gray2};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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
