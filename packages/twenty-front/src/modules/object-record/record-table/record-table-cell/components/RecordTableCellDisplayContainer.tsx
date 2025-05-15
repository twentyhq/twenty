import { Theme, withTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { Ref } from 'react';

const StyledOuterContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 8px;
  width: 100%;
`;

const StyledInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
`;

const StyledEmptyPlaceholderField = withTheme(styled.div<{ theme: Theme }>`
  color: ${({ theme }) => theme.font.color.light};
  padding-left: 4px;
`);

export type EditableCellDisplayContainerProps = {
  focus?: boolean;
  onClick?: () => void;
  scrollRef?: Ref<HTMLDivElement>;
  isHovered?: boolean;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  placeholderForEmptyCell?: string;
};

export const RecordTableCellDisplayContainer = ({
  children,
  focus,
  onClick,
  scrollRef,
  onContextMenu,
  placeholderForEmptyCell,
}: React.PropsWithChildren<EditableCellDisplayContainerProps>) => (
  <StyledOuterContainer
    data-testid={
      focus ? 'editable-cell-focus-mode' : 'editable-cell-display-mode'
    }
    onClick={onClick}
    ref={scrollRef}
    onContextMenu={onContextMenu}
  >
    {placeholderForEmptyCell ? (
      <StyledEmptyPlaceholderField>
        {'Set ' + placeholderForEmptyCell}
      </StyledEmptyPlaceholderField>
    ) : (
      <StyledInnerContainer>{children}</StyledInnerContainer>
    )}
  </StyledOuterContainer>
);
