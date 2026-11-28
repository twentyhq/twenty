import { styled } from '@linaria/react';

import { CHAT_COMPOSER_BOX_GAP } from '@/chat/constants/ChatComposerBoxGap';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatComposerBox = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: calc(
    ${themeCssVariables.border.radius.md} + ${themeCssVariables.spacing[1]}
  );
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${CHAT_COMPOSER_BOX_GAP};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:focus-within {
    border-color: ${themeCssVariables.accent.accent9};
    box-shadow: 0px 0px 0px 3px ${themeCssVariables.color.transparent.blue2};
  }
`;
