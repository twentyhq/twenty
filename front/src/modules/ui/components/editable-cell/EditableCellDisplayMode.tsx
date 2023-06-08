import { ReactElement } from 'react';
import styled from '@emotion/styled';

export const EditableCellNormalModeOuterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;

  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(1)};

  &:hover {
    background: ${(props) => props.theme.secondaryBackgroundTransparent};

    -webkit-box-shadow: inset 0 0 0 1px ${(props) => props.theme.text20};
    -moz-box-shadow: inset 0 0 0 1px ${(props) => props.theme.text20};
    box-shadow: inset 0 0 0 1px ${(props) => props.theme.text20};

    border-radius: ${(props) => props.theme.borderRadius};
  }
`;

export const EditableCellNormalModeInnerContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
