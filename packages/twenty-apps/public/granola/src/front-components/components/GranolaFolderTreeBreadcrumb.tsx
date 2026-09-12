import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const GRANOLA_FOLDER_TREE_INDENT_PIXELS = 24;
const ROW_HEIGHT_PIXELS = 28;
const ICON_CENTER_OFFSET_PIXELS = 8;

const StyledOverlay = styled.div<{ $depth: number }>`
  height: ${ROW_HEIGHT_PIXELS}px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: ${({ $depth }) => $depth * GRANOLA_FOLDER_TREE_INDENT_PIXELS}px;
`;

const StyledAncestorLine = styled.div<{ $index: number; $isVisible: boolean }>`
  background: ${({ $isVisible }) =>
    $isVisible ? themeCssVariables.border.color.strong : 'transparent'};
  height: ${ROW_HEIGHT_PIXELS}px;
  left: ${({ $index }) =>
    $index * GRANOLA_FOLDER_TREE_INDENT_PIXELS + ICON_CENTER_OFFSET_PIXELS}px;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledConnector = styled.div<{ $depth: number }>`
  height: ${ROW_HEIGHT_PIXELS}px;
  left: ${({ $depth }) =>
    ($depth - 1) * GRANOLA_FOLDER_TREE_INDENT_PIXELS +
    ICON_CENTER_OFFSET_PIXELS}px;
  position: absolute;
  top: 0;
  width: ${GRANOLA_FOLDER_TREE_INDENT_PIXELS - ICON_CENTER_OFFSET_PIXELS}px;
`;

const StyledVerticalLineTop = styled.div`
  background: ${() => themeCssVariables.border.color.strong};
  height: 12px;
  left: 0;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledRoundedCorner = styled.div`
  border-bottom: 1px solid ${() => themeCssVariables.border.color.strong};
  border-bottom-left-radius: 4px;
  border-left: 1px solid ${() => themeCssVariables.border.color.strong};
  height: 8px;
  left: 0;
  position: absolute;
  top: 6px;
  width: 8px;
`;

const StyledVerticalLineBottom = styled.div`
  background: ${() => themeCssVariables.border.color.strong};
  height: 16px;
  left: 0;
  position: absolute;
  top: 12px;
  width: 1px;
`;

type GranolaFolderTreeBreadcrumbProps = {
  depth: number;
  isLast: boolean;
  parentsIsLastList: boolean[];
};

export const GranolaFolderTreeBreadcrumb = ({
  depth,
  isLast,
  parentsIsLastList,
}: GranolaFolderTreeBreadcrumbProps) => (
  <StyledOverlay $depth={depth}>
    {parentsIsLastList.map((parentIsLast, index) => (
      <StyledAncestorLine
        key={index}
        $index={index}
        $isVisible={!parentIsLast}
      />
    ))}
    <StyledConnector $depth={depth}>
      <StyledVerticalLineTop />
      <StyledRoundedCorner />
      {!isLast && <StyledVerticalLineBottom />}
    </StyledConnector>
  </StyledOverlay>
);
