import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  type AskQuestionToolResult,
  type AskQuestionsToolResult,
} from 'twenty-shared/ai';
import { IconHelpCircle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatAskStatusRow } from '@/ai/components/AiChatAskStatusRow';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import { getAskedQuestionEntries } from '@/ai/utils/getAskedQuestionEntries';
import {
  StyledAiChatAskStatusDetail,
  StyledAiChatAskStatusMessage,
} from '@/ai/components/AiChatAskStyledComponents';

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

export const AiChatQuestionStatusRenderer = ({
  toolPart,
  isStreaming,
}: {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
}) => {
  const { t } = useLingui();

  const result = (
    toolPart.output as {
      result?: AskQuestionToolResult | AskQuestionsToolResult;
    } | null
  )?.result;
  const status = result?.status ?? 'pending';
  const entries = getAskedQuestionEntries(result);

  if (status === 'pending') {
    return (
      <AiChatAskStatusRow
        Icon={IconHelpCircle}
        message={
          entries.length === 1
            ? entries[0].question.question
            : t`Asking questions...`
        }
        isShimmering={isStreaming}
      />
    );
  }

  if (status === 'skipped') {
    return (
      <AiChatAskStatusRow
        Icon={IconHelpCircle}
        message={
          entries.length > 1 ? t`Questions skipped` : t`Question skipped`
        }
        isShimmering={false}
      />
    );
  }

  return (
    <StyledAnswersCard>
      <StyledAiChatAskStatusMessage>{t`Answers`}</StyledAiChatAskStatusMessage>
      {entries.map(({ question, answer }, index) => {
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
            <StyledAnswerQuestion>
              <TextWithChatReferences text={question.question} />
            </StyledAnswerQuestion>
            <StyledAiChatAskStatusDetail>
              <TextWithChatReferences text={value} />
            </StyledAiChatAskStatusDetail>
          </StyledAnswerBlock>
        );
      })}
    </StyledAnswersCard>
  );
};
