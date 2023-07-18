import styled from '@emotion/styled';

import { RightDrawerTopBarCloseButton } from './RightDrawerTopBarCloseButton';

const StyledRightDrawerTopBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 56px;
  justify-content: space-between;
  padding-left: 8px;
  padding-right: 8px;
`;

type OwnProps = {
  title?: string | null | undefined;
};

export function RightDrawerTopBar({ title }: OwnProps) {
  return (
    <StyledRightDrawerTopBar>
      <RightDrawerTopBarCloseButton />
    </StyledRightDrawerTopBar>
  );
}
