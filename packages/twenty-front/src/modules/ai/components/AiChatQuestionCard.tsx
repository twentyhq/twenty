import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent, useState } from 'react';
import {
  type AskQuestionResponse,
  type AskQuestionToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, LightIconButton } from 'twenty-ui/components/input';
import {
  IconArrowUp,
  type IconComponent,
  IconInfoCircle,
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconSquareNumber4,
  IconSquareNumber5,
  IconSquareNumber6,
  IconSquareNumber7,
  IconSquareNumber8,
  IconSquareNumber9,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import { AiChatComposerActionsRow } from '@/ai/components/internal/AiChatComposerActionsRow';
import { AiChatQuestionOtherOption } from '@/ai/components/internal/AiChatQuestionOtherOption';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const NUMBER_ICONS: IconComponent[] = [
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconSquareNumber4,
  IconSquareNumber5,
  IconSquareNumber6,
  IconSquareNumber7,
  IconSquareNumber8,
  IconSquareNumber9,
];

const getOptionNumberIcon = (optionIndex: number) =>
  NUMBER_ICONS[Math.min(optionIndex, NUMBER_ICONS.length - 1)];

const StyledQuestionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledQuestionHeaderRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-height: 24px;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledQuestionText = styled.p`
  color: ${themeCssVariables.font.color.primary};
  flex: 1 0 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const StyledOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledOptionRow = styled.div<{ isHighlighted: boolean }>`
  align-items: center;
  background: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 32px;
  justify-content: space-between;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledOptionLeft = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
`;

const StyledOptionLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRecommended = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
`;

const StyledDivider = styled.div`
  background: ${themeCssVariables.border.color.light};
  height: 1px;
  width: 100%;
`;

const StyledComposerSection = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatQuestionCardProps = {
  pendingQuestion: AgentChatPendingQuestion;
};

export const AiChatQuestionCard = ({
  pendingQuestion: { toolCallId, question },
}: AiChatQuestionCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const [selectedOptionIndices, setSelectedOptionIndices] = useState<number[]>(
    [],
  );
  const [freeText, setFreeText] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();

  const isMultiSelect = question.allowMultiSelect === true;
  const trimmedFreeText = freeText.trim();
  const isAnswered =
    selectedOptionIndices.length > 0 ||
    (isOtherSelected && trimmedFreeText.length > 0);

  const submit = async (answer: AskQuestionResponse) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const isAnswerRecorded = await answerAgentChatToolCall({
      toolCallId,
      response: answer,
      optimisticToolOutput: {
        success: true,
        result: {
          question,
          status: 'answered',
          answer,
        } satisfies AskQuestionToolResult,
      },
    });

    // The card goes once its call is closed, so it stays disabled until then.
    if (!isAnswerRecorded) {
      setIsSubmitting(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isMultiSelect) {
      setSelectedOptionIndices((previous) =>
        previous.includes(optionIndex)
          ? previous.filter((value) => value !== optionIndex)
          : [...previous, optionIndex],
      );

      return;
    }

    setSelectedOptionIndices([optionIndex]);
    setIsOtherSelected(false);
    void submit({ selectedOptionIndices: [optionIndex] });
  };

  const selectOther = () => {
    setIsOtherSelected(true);

    if (!isMultiSelect) {
      setSelectedOptionIndices([]);
    }
  };

  const handleToggleOther = () => {
    if (isMultiSelect && isOtherSelected) {
      setIsOtherSelected(false);

      return;
    }

    selectOther();
  };

  const handleOtherTextChange = (value: string) => {
    setFreeText(value);

    if (value.trim().length > 0) {
      selectOther();
    }
  };

  const handleSend = () => {
    if (!isAnswered) {
      return;
    }

    void submit({
      selectedOptionIndices,
      freeText:
        isOtherSelected && trimmedFreeText.length > 0
          ? trimmedFreeText
          : undefined,
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <StyledAiChatAskCard>
      <StyledQuestionSection>
        <StyledQuestionHeaderRow>
          <StyledQuestionText>
            <TextWithChatReferences text={question.question} />
          </StyledQuestionText>
        </StyledQuestionHeaderRow>

        <StyledOptionsList>
          {question.options.map((option, optionIndex) => {
            const NumberIcon = getOptionNumberIcon(optionIndex);
            const isSelected = selectedOptionIndices.includes(optionIndex);
            const hasSelection =
              selectedOptionIndices.length > 0 || isOtherSelected;
            const isHighlighted =
              isSelected || (!hasSelection && option.isRecommended === true);

            return (
              <StyledOptionRow
                key={optionIndex}
                isHighlighted={isHighlighted}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectOption(optionIndex)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelectOption(optionIndex);
                  }
                }}
              >
                <StyledOptionLeft>
                  <NumberIcon
                    size={theme.icon.size.sm}
                    color={themeCssVariables.font.color.tertiary}
                  />
                  <StyledOptionLabel>
                    <TextWithChatReferences text={option.label} />
                  </StyledOptionLabel>
                  {option.isRecommended === true && (
                    <StyledRecommended>· {t`Recommended`}</StyledRecommended>
                  )}
                </StyledOptionLeft>
                {isDefined(option.description) && (
                  <Tooltip
                    content={option.description}
                    delay={TooltipDelay.shortDelay}
                    side="left"
                  >
                    <span onClick={(event) => event.stopPropagation()}>
                      <LightIconButton
                        size="sm"
                        emphasis="subtle"
                        aria-label={t`Information`}
                      >
                        <IconInfoCircle />
                      </LightIconButton>
                    </span>
                  </Tooltip>
                )}
              </StyledOptionRow>
            );
          })}
          <AiChatQuestionOtherOption
            NumberIcon={getOptionNumberIcon(question.options.length)}
            isHighlighted={isOtherSelected}
            value={freeText}
            onChange={handleOtherTextChange}
            onSelect={handleToggleOther}
            onTextareaKeyDown={handleKeyDown}
          />
        </StyledOptionsList>
      </StyledQuestionSection>

      <StyledDivider />

      <StyledComposerSection>
        <AiChatComposerActionsRow
          modelTierDropdownId={`ai-chat-question-model-tier-dropdown-${toolCallId}`}
          sendButton={
            <IconButton
              variant="solid"
              color="accent"
              shape="round"
              aria-label={t`Send message`}
              size="sm"
              onClick={handleSend}
              disabled={!isAnswered || isSubmitting}
            >
              <IconArrowUp />
            </IconButton>
          }
        />
      </StyledComposerSection>
    </StyledAiChatAskCard>
  );
};
