import styled from '@emotion/styled';
import { IconPlus } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';

const StyledButton = styled.button`
  height: 24px;
  width: 24px;
  border: 1px solid ${(props) => props.theme.lightBorder};
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 3px;

  border-radius: 4px;

  transition: ${(props) => props.theme.clickableElementBackgroundTransition};
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
