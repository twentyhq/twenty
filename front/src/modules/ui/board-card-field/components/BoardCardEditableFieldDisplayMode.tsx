import styled from '@emotion/styled';

export const BoardCardFieldDisplayModeOuterContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

export const BoardCardFieldDisplayModeInnerContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export function BoardCardEditableFieldDisplayMode({
  children,
}: React.PropsWithChildren<unknown>) {
  return (
    <BoardCardFieldDisplayModeOuterContainer>
      <BoardCardFieldDisplayModeInnerContainer>
        {children}
      </BoardCardFieldDisplayModeInnerContainer>
    </BoardCardFieldDisplayModeOuterContainer>
  );
}
