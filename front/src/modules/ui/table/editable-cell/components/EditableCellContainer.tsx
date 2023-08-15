import { Ref } from 'react';
import styled from '@emotion/styled';

export type EditableCellDisplayContainerProps = {
  softFocus?: boolean;
  onClick?: () => void;
  scrollRef?: Ref<HTMLDivElement>;
};

const StyledEditableCellDisplayModeOuterContainer = styled.div<
  Pick<EditableCellDisplayContainerProps, 'softFocus'>
>`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  ${(props) =>
    props.softFocus
      ? `background: ${props.theme.background.transparent.secondary};
        border-radius: ${props.theme.border.radius.sm};
        box-shadow: inset 0 0 0 1px ${props.theme.font.color.extraLight};`
      : ''}
`;

const EditableCellDisplayModeInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export function EditableCellDisplayContainer({
  children,
  softFocus,
  onClick,
  scrollRef,
}: React.PropsWithChildren<EditableCellDisplayContainerProps>) {
  return (
    <StyledEditableCellDisplayModeOuterContainer
      data-testid={
        softFocus
          ? 'editable-cell-soft-focus-mode'
          : 'editable-cell-display-mode'
      }
      onClick={onClick}
      softFocus={softFocus}
      ref={scrollRef}
    >
      <EditableCellDisplayModeInnerContainer>
        {children}
      </EditableCellDisplayModeInnerContainer>
    </StyledEditableCellDisplayModeOuterContainer>
  );
}
