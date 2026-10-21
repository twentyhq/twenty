import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledAvatar = styled.div`
  align-items: center;
  background: ${themeCssVariables.color.blue3};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  gap: 5px;
  height: 40px;
  justify-content: center;
  width: 40px;

  &::before,
  &::after {
    background: ${themeCssVariables.color.blue11};
    border-radius: ${themeCssVariables.border.radius.pill};
    content: '';
    height: 10px;
    width: 5px;
  }
`;

export const AiChatWelcomeAvatar = () => <StyledAvatar aria-hidden />;
