import styled from '@emotion/styled';

import { useIsMobile } from '../../../../hooks/useIsMobile';

import { RightDrawerTopBarCloseButton } from './RightDrawerTopBarCloseButton';
import { RightDrawerTopBarExpandButton } from './RightDrawerTopBarExpandButton';

const StyledRightDrawerTopBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 56px;
  justify-content: flex-start;
  padding-left: ${({ theme }) => theme.spacing(2)};

  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export function RightDrawerTopBar() {
  const isMobile = useIsMobile();

  return (
    <StyledRightDrawerTopBar>
      <RightDrawerTopBarCloseButton />
      {!isMobile && <RightDrawerTopBarExpandButton />}
    </StyledRightDrawerTopBar>
  );
}
