import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const BREADCRUMB_WIDTH = 24;
const ICON_CENTER_OFFSET = 8;

export type SettingsMessageFoldersBreadcrumbProps = {
  depth: number;
  isLast: boolean;
  parentsIsLastList: boolean[];
};

// Every offset here is an inset from the side the tree grows out of, so the
// whole connector mirrors with the document under dir="rtl".
const StyledBreadcrumbOverlay = styled.div<{ depth: number }>`
  height: 28px;
  inset-inline-start: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: ${({ depth }) => depth * BREADCRUMB_WIDTH}px;
`;

const StyledAncestorLine = styled.div<{
  index: number;
  showLine: boolean;
}>`
  background: ${({ showLine }) =>
    showLine ? themeCssVariables.border.color.strong : 'transparent'};
  height: 28px;
  inset-inline-start: ${({ index }) =>
    index * BREADCRUMB_WIDTH + ICON_CENTER_OFFSET}px;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledBreadcrumbConnector = styled.div<{ depth: number }>`
  height: 28px;
  inset-inline-start: ${({ depth }) =>
    (depth - 1) * BREADCRUMB_WIDTH + ICON_CENTER_OFFSET}px;
  position: absolute;
  top: 0;
  width: ${BREADCRUMB_WIDTH - ICON_CENTER_OFFSET}px;
`;

const StyledVerticalLineTop = styled.div`
  background: ${themeCssVariables.border.color.strong};
  height: 12px;
  inset-inline-start: 0;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledRoundedCorner = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.strong};
  border-end-start-radius: 4px;
  border-inline-start: 1px solid ${themeCssVariables.border.color.strong};
  height: 8px;
  inset-inline-start: 0;
  position: absolute;
  top: 6px;
  width: 8px;
`;

const StyledVerticalLineBottom = styled.div`
  background: ${themeCssVariables.border.color.strong};
  height: 16px;
  inset-inline-start: 0;
  position: absolute;
  top: 12px;
  width: 1px;
`;

export const SettingsMessageFoldersBreadcrumb = ({
  depth,
  isLast,
  parentsIsLastList,
}: SettingsMessageFoldersBreadcrumbProps) => {
  const showVerticalBar = !isLast;

  return (
    <StyledBreadcrumbOverlay depth={depth}>
      {parentsIsLastList.map((parentIsLast, index) => (
        <StyledAncestorLine
          key={index}
          index={index}
          showLine={!parentIsLast}
        />
      ))}
      <StyledBreadcrumbConnector depth={depth}>
        <StyledVerticalLineTop />
        <StyledRoundedCorner />
        {showVerticalBar && <StyledVerticalLineBottom />}
      </StyledBreadcrumbConnector>
    </StyledBreadcrumbOverlay>
  );
};
