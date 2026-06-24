import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RECORD_BOARD_LOADING_SKELETON_COLUMNS_COUNT } from '@/object-record/record-board/constants/RecordBoardLoadingSkeletonColumnsCount';

const StyledHeaderCell = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  max-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  min-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledTitleSkeleton = styled.div`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 16px;
  width: 96px;
`;

export const RecordBoardLoadingSkeletonColumnHeaders = () => {
  return Array.from(
    { length: RECORD_BOARD_LOADING_SKELETON_COLUMNS_COUNT },
    (_, index) => (
      <StyledHeaderCell key={`record-board-skeleton-column-header-${index}`}>
        <StyledTitleSkeleton />
      </StyledHeaderCell>
    ),
  );
};
