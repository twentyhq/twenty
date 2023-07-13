import styled from '@emotion/styled';

import { useSetSoftFocusOnCurrentCell } from './hooks/useSetSoftFocusOnCurrentCell';

type Props = {
  softFocus?: boolean;
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
      ? `background: ${props.theme.background.transparent.secondary};
         border-radius: ${props.theme.border.radius.md};
         box-shadow: inset 0 0 0 1px ${props.theme.font.color.extraLight};`
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
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  function handleOnClick() {
    setSoftFocusOnCurrentCell();
  }

  return (
    <EditableCellNormalModeOuterContainer onClick={handleOnClick}>
      <EditableCellNormalModeInnerContainer>
        {children}
      </EditableCellNormalModeInnerContainer>
    </EditableCellNormalModeOuterContainer>
  );
}
