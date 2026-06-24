import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RECORD_BOARD_LOADING_SKELETON_COLUMNS_COUNT } from '@/object-record/record-board/constants/RecordBoardLoadingSkeletonColumnsCount';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
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

export const RecordBoardLoadingSkeletonColumnHeaders = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      {Array.from(
        { length: RECORD_BOARD_LOADING_SKELETON_COLUMNS_COUNT },
        (_, index) => (
          <StyledHeaderCell
            key={`record-board-skeleton-column-header-${index}`}
          >
            <Skeleton width={96} height={16} />
          </StyledHeaderCell>
        ),
      )}
    </SkeletonTheme>
  );
};
