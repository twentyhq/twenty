import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RECORD_BOARD_LOADING_SKELETON_COLUMNS_COUNT } from '@/object-record/record-board/constants/RecordBoardLoadingSkeletonColumnsCount';
import { RecordBoardColumnLoadingSkeletonCards } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnLoadingSkeletonCards';

const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  max-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  min-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  padding: ${themeCssVariables.spacing[2]};
  padding-top: 0px;
  position: relative;
`;

export const RecordBoardLoadingSkeletonColumns = () => {
  return Array.from(
    { length: RECORD_BOARD_LOADING_SKELETON_COLUMNS_COUNT },
    (_, index) => (
      <StyledColumn key={`record-board-skeleton-column-${index}`}>
        <RecordBoardColumnLoadingSkeletonCards />
      </StyledColumn>
    ),
  );
};
