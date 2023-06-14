import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconPlus } from '@/ui/icons/index';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';

const StyledButton = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${(props) => props.theme.lightBorder};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 24px;
  padding: 3px;

  transition: ${(props) => props.theme.clickableElementBackgroundTransition};

  width: 24px;
  &:hover {
    background: ${(props) => props.theme.clickableElementBackgroundHover};
  }
  svg {
    color: ${(props) => props.theme.text40};
    transform: rotate(45deg);
  }
`;

export function RightDrawerTopBarCloseButton() {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  function handleButtonClick() {
    setIsRightDrawerOpen(false);
  }

  return (
    <StyledButton onClick={handleButtonClick}>
      <IconPlus size={16} />
    </StyledButton>
  );
}
