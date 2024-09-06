import { Ref } from 'react';
import { styled } from '@linaria/react';

const StyledOuterContainer = styled.div<{
  hasSoftFocus?: boolean;
}>`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 6px;
  width: 100%;
`;

const StyledInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
  flex-wrap: wrap;
`;

export type EditableCellDisplayContainerProps = {
  softFocus?: boolean;
  onClick?: () => void;
  scrollRef?: Ref<HTMLDivElement>;
  isHovered?: boolean;
};

export const RecordTableCellDisplayContainer = ({
  children,
  softFocus,
  onClick,
  scrollRef,
}: React.PropsWithChildren<EditableCellDisplayContainerProps>) => (
  <StyledOuterContainer
    data-testid={
      softFocus ? 'editable-cell-soft-focus-mode' : 'editable-cell-display-mode'
    }
    onClick={onClick}
    ref={scrollRef}
    hasSoftFocus={softFocus}
  >
    <StyledInnerContainer>{children}</StyledInnerContainer>
  </StyledOuterContainer>
);
