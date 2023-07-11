import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconChevronsRight } from '@/ui/icons/index';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';

const StyledButton = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 24px;
  padding: 3px;

  transition: ${({ theme }) => theme.clickableElementBackgroundTransition};

  width: 24px;
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
  svg {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export function RightDrawerTopBarCloseButton() {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  function handleButtonClick() {
    setIsRightDrawerOpen(false);
  }

  return (
    <StyledButton onClick={handleButtonClick}>
      <IconChevronsRight size={16} />
    </StyledButton>
  );
}
