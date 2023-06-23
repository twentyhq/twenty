import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';

type Props = {
  softFocus: boolean;
};

export const EditableCellNormalModeOuterContainer = styled.div<Props>`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: ${(props) => props.theme.spacing(2)};

  padding-right: ${(props) => props.theme.spacing(1)};
  width: 100%;

  ${(props) =>
    props.softFocus
      ? `-moz-box-shadow: inset 0 0 0 1px ${props.theme.text20};

        -webkit-box-shadow: inset 0 0 0 1px ${props.theme.text20};
        background: ${props.theme.secondaryBackgroundTransparent};
        border-radius: ${props.theme.borderRadius};

        box-shadow: inset 0 0 0 1px ${props.theme.text20};
      `
      : ''}
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
    <EditableCellNormalModeOuterContainer softFocus={softFocus}>
      <EditableCellNormalModeInnerContainer>
        {children}
      </EditableCellNormalModeInnerContainer>
    </EditableCellNormalModeOuterContainer>
  );
}
