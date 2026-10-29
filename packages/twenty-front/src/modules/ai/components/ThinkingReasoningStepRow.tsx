import { styled } from '@linaria/react';
import { type ReasoningUIPart } from 'ai';
import { IconCpu, ThinkingOrbitLoaderIcon } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { StyledParagraph } from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { ThinkingStepRowLayout } from '@/ai/components/ThinkingStepRowLayout';
import { getReasoningStepLabel } from '@/ai/utils/getReasoningStepLabel';

const StyledReasoningText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding-left: calc(
    ${themeCssVariables.icon.size.sm} * 1px + ${themeCssVariables.spacing[2]}
  );

  // reasoning uses single newlines as line breaks, which markdown would collapse
  ${StyledParagraph} {
    white-space: pre-line;
  }
`;

type ThinkingReasoningStepRowProps = {
  isActive: boolean;
  part: ReasoningUIPart;
};

export const ThinkingReasoningStepRow = ({
  isActive,
  part,
}: ThinkingReasoningStepRowProps) => (
  <ThinkingStepRowLayout
    icon={isActive ? <ThinkingOrbitLoaderIcon /> : <IconCpu size={14} />}
    label={getReasoningStepLabel({ text: part.text, isActive })}
    isActive={isActive}
    details={
      part.text.trim().length > 0 ? (
        <StyledReasoningText>
          <LazyMarkdownRenderer text={part.text} />
        </StyledReasoningText>
      ) : undefined
    }
  />
);
