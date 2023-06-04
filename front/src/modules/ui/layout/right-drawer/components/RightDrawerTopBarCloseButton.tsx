import { FaTimes } from 'react-icons/fa';
import styled from '@emotion/styled';
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
  padding: 8px;

  border-radius: 4px;

  transition: ${(props) => props.theme.clickableElementBackgroundTransition};
  &:hover {
    background: ${(props) => props.theme.clickableElementBackgroundHover};
  }
`;

export function RightDrawerTopBarCloseButton() {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  function handleButtonClick() {
    setIsRightDrawerOpen(false);
  }

  return (
    <StyledButton onClick={handleButtonClick}>
      <FaTimes />
    </StyledButton>
  );
}
