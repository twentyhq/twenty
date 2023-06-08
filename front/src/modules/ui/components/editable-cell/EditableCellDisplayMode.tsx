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
