import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { useContext } from 'react';
import { type AskQuestionsToolResult } from 'twenty-shared/ai';
import { IconHelpCircle } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { ShimmeringText } from '@/ai/components/ShimmeringText';

const StyledContainer = styled.div`
  align-items: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 0;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const StyledMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledAnswersCard = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAnswerBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledAnswerQuestion = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

const StyledAnswerValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

export const AiChatQuestionStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const result = (toolPart.output as { result?: AskQuestionsToolResult } | null)
    ?.result;
  const questions = result?.questions ?? [];
  const status = result?.status ?? 'pending';

  if (status === 'pending') {
    const label = t`Asking questions...`;

    return (
      <StyledContainer>
        <IconHelpCircle size={theme.icon.size.sm} />
        {isStreaming ? (
          <ShimmeringText>
            <StyledMessage>{label}</StyledMessage>
          </ShimmeringText>
        ) : (
          <StyledMessage>{label}</StyledMessage>
        )}
      </StyledContainer>
    );
  }

  const answers = result?.answers ?? [];

  return (
    <StyledAnswersCard>
      <StyledMessage>{t`Answers`}</StyledMessage>
      {questions.map((question, index) => {
        const answer = answers.find(
          (candidate) => candidate.questionIndex === index,
        );
        const selectedLabels = (answer?.selectedOptionIndices ?? [])
          .map((optionIndex) => question.options[optionIndex]?.label)
          .filter(isNonEmptyString);
        const freeTextAnswer = answer?.freeText ?? '';
        const value =
          freeTextAnswer.length > 0
            ? freeTextAnswer
            : selectedLabels.join(', ');

        if (value.length === 0) {
          return null;
        }

        return (
          <StyledAnswerBlock key={index}>
            <StyledAnswerQuestion>{question.question}</StyledAnswerQuestion>
            <StyledAnswerValue>{value}</StyledAnswerValue>
          </StyledAnswerBlock>
        );
      })}
    </StyledAnswersCard>
  );
};
