import styled from '@emotion/styled';

import { useIsSoftFocusOnCurrentInplaceInput } from './hooks/useIsSoftFocusOnCurrentInplaceInput';

type Props = {
  softFocus: boolean;
};

export const InplaceInputNormalModeOuterContainer = styled.div<Props>`
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
         box-shadow: inset 0 0 0 1px ${props.theme.grayScale.gray30};`
      : ''}
`;

export const InplaceInputNormalModeInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export function InplaceInputDisplayMode({
  children,
}: React.PropsWithChildren<unknown>) {
  const hasSoftFocus = useIsSoftFocusOnCurrentInplaceInput();

  return (
    <InplaceInputNormalModeOuterContainer softFocus={hasSoftFocus}>
      <InplaceInputNormalModeInnerContainer>
        {children}
      </InplaceInputNormalModeInnerContainer>
    </InplaceInputNormalModeOuterContainer>
  );
}
