import { type LogsSwitchTypingFrame } from '@/navigation/types/LogsSwitchTypingFrame';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
`;

const StyledCodeFontText = styled.span`
  font-family: ${themeCssVariables.code.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledCaret = styled.span`
  animation: developer-mode-caret-blink 1.06s steps(1) infinite;
  background: ${themeCssVariables.accent.accent9};
  border-radius: ${themeCssVariables.border.radius.xs};
  display: inline-block;
  height: ${themeCssVariables.spacing[3]};
  margin-left: ${themeCssVariables.spacing[0.5]};
  vertical-align: middle;
  width: ${themeCssVariables.spacing[0.5]};

  @keyframes developer-mode-caret-blink {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

type LogsSwitchLabelProps = {
  label: string;
  frame: LogsSwitchTypingFrame | null;
  isTyping: boolean;
};

export const LogsSwitchLabel = ({
  label,
  frame,
  isTyping,
}: LogsSwitchLabelProps) => {
  if (!isDefined(frame)) {
    return <StyledLabel aria-hidden>{label}</StyledLabel>;
  }

  return (
    <StyledLabel aria-hidden>
      {frame.text.slice(0, frame.codeFontStart)}
      <StyledCodeFontText>
        {frame.text.slice(frame.codeFontStart, frame.codeFontEnd)}
      </StyledCodeFontText>
      {frame.text.slice(frame.codeFontEnd)}
      {isTyping && <StyledCaret />}
    </StyledLabel>
  );
};
