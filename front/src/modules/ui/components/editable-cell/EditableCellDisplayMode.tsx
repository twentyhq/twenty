import styled from '@emotion/styled';

import { useIsSoftFocusOnCurrentCell } from './hooks/useIsSoftFocusOnCurrentCell';

type Props = {
  softFocus: boolean;
};

export const EditableCellNormalModeOuterContainer = styled.div<Props>`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  ${(props) =>
    props.softFocus
      ? `-moz-box-shadow: inset 0 0 0 1px ${props.theme.grayScale.gray20};

        -webkit-box-shadow: inset 0 0 0 1px ${props.theme.grayScale.gray20};
        background: ${props.theme.background.transparent.secondary};
        border-radius: ${props.theme.border.radius.md};

        box-shadow: inset 0 0 0 1px ${props.theme.grayScale.gray20};
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

export function EditableCellDisplayMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const hasSoftFocus = useIsSoftFocusOnCurrentCell();

  return (
    <EditableCellNormalModeOuterContainer softFocus={hasSoftFocus}>
      <EditableCellNormalModeInnerContainer>
        {children}
      </EditableCellNormalModeInnerContainer>
    </EditableCellNormalModeOuterContainer>
  );
}
