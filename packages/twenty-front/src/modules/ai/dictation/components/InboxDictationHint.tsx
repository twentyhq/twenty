import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type InboxDictationHintProps = {
  interimText: string;
};

export const InboxDictationHint = ({
  interimText,
}: InboxDictationHintProps) => {
  if (!isNonEmptyString(interimText)) {
    return null;
  }

  return <StyledHint aria-live="polite">{interimText}</StyledHint>;
};
