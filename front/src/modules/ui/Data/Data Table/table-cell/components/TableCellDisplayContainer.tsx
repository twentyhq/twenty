import { Ref } from 'react';
import styled from '@emotion/styled';

export type EditableCellDisplayContainerProps = {
  softFocus?: boolean;
  onClick?: () => void;
  scrollRef?: Ref<HTMLDivElement>;
  isHovered?: boolean;
};

const StyledEditableCellDisplayModeOuterContainer = styled.div<
  Pick<EditableCellDisplayContainerProps, 'softFocus' | 'isHovered'>
>`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  ${(props) =>
    props.softFocus || props.isHovered
      ? `background: ${props.theme.background.transparent.secondary};
      border-radius: ${props.theme.border.radius.sm};
      outline: 1px solid ${props.theme.font.color.extraLight};`
      : ''}
`;

const StyledEditableCellDisplayModeInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const TableCellDisplayContainer = ({
  children,
  softFocus,
  onClick,
  scrollRef,
  isHovered,
}: React.PropsWithChildren<EditableCellDisplayContainerProps>) => (
  <StyledEditableCellDisplayModeOuterContainer
    data-testid={
      softFocus ? 'editable-cell-soft-focus-mode' : 'editable-cell-display-mode'
    }
    onClick={onClick}
    isHovered={isHovered}
    softFocus={softFocus}
    ref={scrollRef}
  >
    <StyledEditableCellDisplayModeInnerContainer>
      {children}
    </StyledEditableCellDisplayModeInnerContainer>
  </StyledEditableCellDisplayModeOuterContainer>
);
