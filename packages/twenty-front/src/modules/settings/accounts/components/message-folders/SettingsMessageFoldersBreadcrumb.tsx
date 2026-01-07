import styled from '@emotion/styled';

const BREADCRUMB_WIDTH = 24;
const ICON_CENTER_OFFSET = 8;

export type SettingsMessageFoldersBreadcrumbProps = {
  depth: number;
  isLast: boolean;
  parentsIsLastList: boolean[];
};

const StyledBreadcrumbOverlay = styled.div<{ depth: number }>`
  height: 28px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: ${({ depth }) => depth * BREADCRUMB_WIDTH}px;
`;

const StyledAncestorLine = styled.div<{
  index: number;
  showLine: boolean;
}>`
  background: ${({ theme, showLine }) =>
    showLine ? theme.border.color.strong : 'transparent'};
  height: 28px;
  left: ${({ index }) => index * BREADCRUMB_WIDTH + ICON_CENTER_OFFSET}px;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledBreadcrumbConnector = styled.div<{ depth: number }>`
  height: 28px;
  left: ${({ depth }) => (depth - 1) * BREADCRUMB_WIDTH + ICON_CENTER_OFFSET}px;
  position: absolute;
  top: 0;
  width: ${BREADCRUMB_WIDTH - ICON_CENTER_OFFSET}px;
`;

const StyledVerticalLineTop = styled.div`
  background: ${({ theme }) => theme.border.color.strong};
  height: 12px;
  left: 0;
  position: absolute;
  top: 0;
  width: 1px;
`;

const StyledRoundedCorner = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.strong};
  border-bottom-left-radius: 4px;
  border-left: 1px solid ${({ theme }) => theme.border.color.strong};
  height: 8px;
  left: 0;
  position: absolute;
  top: 6px;
  width: 8px;
`;

const StyledVerticalLineBottom = styled.div`
  background: ${({ theme }) => theme.border.color.strong};
  height: 16px;
  left: 0;
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
