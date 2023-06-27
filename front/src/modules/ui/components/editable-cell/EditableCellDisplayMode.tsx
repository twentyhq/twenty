import { ReactElement } from 'react';
import styled from '@emotion/styled';

export const EditableCellNormalModeOuterContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  &:hover {
    -moz-box-shadow: inset 0 0 0 1px
      ${({ theme }) => theme.font.color.extraLight};

    -webkit-box-shadow: inset 0 0 0 1px
      ${({ theme }) => theme.font.color.extraLight};
    background: ${({ theme }) => theme.background.transparent.secondary};
    border-radius: ${({ theme }) => theme.border.radius.md};

    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.font.color.extraLight};
  }
`;

export const EditableCellNormalModeInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

type OwnProps = {
  children: ReactElement;
};

export function EditableCellDisplayMode({ children }: OwnProps) {
  return (
    <EditableCellNormalModeOuterContainer>
      <EditableCellNormalModeInnerContainer>
        {children}
      </EditableCellNormalModeInnerContainer>
    </EditableCellNormalModeOuterContainer>
  );
}
