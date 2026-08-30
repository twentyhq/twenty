import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type AiChatDictationHintProps = {
  interimText: string;
};

export const AiChatDictationHint = ({
  interimText,
}: AiChatDictationHintProps) => {
  if (interimText === '') {
    return null;
  }

  // Announced politely so a screen-reader user hears the recognition working
  // without it interrupting whatever they are reading.
  return <StyledHint aria-live="polite">{interimText}</StyledHint>;
};
