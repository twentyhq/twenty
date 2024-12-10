import { styled } from '@linaria/react';
import { Ref } from 'react';

const StyledOuterContainer = styled.div<{
  hasSoftFocus?: boolean;
}>`
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

export type EditableCellDisplayContainerProps = {
  softFocus?: boolean;
  onClick?: () => void;
  scrollRef?: Ref<HTMLDivElement>;
  isHovered?: boolean;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const RecordTableCellDisplayContainer = ({
  children,
  softFocus,
  onClick,
  scrollRef,
  onContextMenu,
}: React.PropsWithChildren<EditableCellDisplayContainerProps>) => (
  <StyledOuterContainer
    data-testid={
      softFocus ? 'editable-cell-soft-focus-mode' : 'editable-cell-display-mode'
    }
    onClick={onClick}
    ref={scrollRef}
    hasSoftFocus={softFocus}
    onContextMenu={onContextMenu}
  >
    <StyledInnerContainer>{children}</StyledInnerContainer>
  </StyledOuterContainer>
);
