import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent, useContext, useMemo, useState } from 'react';
import { type AskQuestionAnswer, type AskQuestionItem } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import {
  IconArrowUp,
  IconChevronLeft,
  IconChevronRightPipe,
  IconInfoCircle,
  type IconComponent,
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
import {
  LightIconButton,
  RoundedIconButton,
  type SelectOption,
} from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { AgentChatFileUploadButton } from '@/ai/components/internal/AgentChatFileUploadButton';
import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import { TextWithRecordLinks } from '@/ai/components/TextWithRecordLinks';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { useSubmitQuestionAnswer } from '@/ai/hooks/useSubmitQuestionAnswer';
import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';
import { Select } from '@/ui/input/components/Select';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

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

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

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

const StyledPager = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPagerLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
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
  gap: ${themeCssVariables.spacing[2]};
  min-height: 80px;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFreeTextArea = styled.textarea`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1 0 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  min-height: 24px;
  outline: none;
  resize: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;

const StyledActionsRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledLeftActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledRightActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const areAllQuestionsAnswered = (
  questions: AskQuestionItem[],
  selectedByQuestion: Record<number, number[]>,
  freeTextByQuestion: Record<number, string>,
) =>
  questions.every(
    (_, index) =>
      (selectedByQuestion[index]?.length ?? 0) > 0 ||
      (freeTextByQuestion[index] ?? '').trim().length > 0,
  );

type AiChatQuestionCardProps = {
  pendingQuestion: AgentChatPendingQuestion;
};

export const AiChatQuestionCard = ({
  pendingQuestion,
}: AiChatQuestionCardProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { messageId, toolCallId, questions } = pendingQuestion;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<
    Record<number, number[]>
  >({});
  const [freeTextByQuestion, setFreeTextByQuestion] = useState<
    Record<number, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitAnswer } = useSubmitQuestionAnswer();

  const { options: modelOptions, pinnedOption } = useAiModelOptions({
    variant: 'pinned-default',
  });
  const { enabledModels } = useWorkspaceAiModelAvailability();
  const hasNoEnabledModels = enabledModels.length === 0;
  const { selectedModelId } = useAgentChatModelId();
  const setAgentChatUserSelectedModel = useSetAtomState(
    agentChatUserSelectedModelState,
  );
  const defaultPinnedOption: SelectOption<string | null> | undefined =
    pinnedOption ? { ...pinnedOption, value: null } : undefined;

  const currentQuestion = questions[currentIndex];
  const hasMultipleQuestions = questions.length > 1;
  const isLastQuestion = currentIndex === questions.length - 1;

  const buildAnswers = (
    selected: Record<number, number[]>,
  ): AskQuestionAnswer[] =>
    questions.map((_, index) => {
      const trimmedFreeText = (freeTextByQuestion[index] ?? '').trim();

      return {
        questionIndex: index,
        selectedOptionIndices: selected[index] ?? [],
        freeText: trimmedFreeText.length > 0 ? trimmedFreeText : undefined,
      };
    });

  const submit = async (answers: AskQuestionAnswer[]) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    await submitAnswer({ messageId, toolCallId, answers });
    setIsSubmitting(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (currentQuestion.allowMultiSelect === true) {
      setSelectedByQuestion((previous) => {
        const current = previous[currentIndex] ?? [];
        const next = current.includes(optionIndex)
          ? current.filter((value) => value !== optionIndex)
          : [...current, optionIndex];

        return { ...previous, [currentIndex]: next };
      });

      return;
    }

    const nextSelected = {
      ...selectedByQuestion,
      [currentIndex]: [optionIndex],
    };

    setSelectedByQuestion(nextSelected);

    if (!isLastQuestion) {
      setCurrentIndex(currentIndex + 1);

      return;
    }

    if (areAllQuestionsAnswered(questions, nextSelected, freeTextByQuestion)) {
      void submit(buildAnswers(nextSelected));
    }
  };

  const allQuestionsAnswered = useMemo(
    () =>
      areAllQuestionsAnswered(
        questions,
        selectedByQuestion,
        freeTextByQuestion,
      ),
    [questions, selectedByQuestion, freeTextByQuestion],
  );

  const handleSend = () => {
    if (!allQuestionsAnswered) {
      return;
    }

    void submit(buildAnswers(selectedByQuestion));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!isLastQuestion) {
        setCurrentIndex(currentIndex + 1);

        return;
      }

      handleSend();
    }
  };

  return (
    <StyledCard>
      <StyledQuestionSection>
        <StyledQuestionHeaderRow>
          <StyledQuestionText>
            <TextWithRecordLinks text={currentQuestion.question} />
          </StyledQuestionText>
          {hasMultipleQuestions && (
            <StyledPager>
              <LightIconButton
                Icon={IconChevronLeft}
                size="small"
                disabled={currentIndex === 0}
                onClick={() =>
                  setCurrentIndex((index) => Math.max(0, index - 1))
                }
              />
              <StyledPagerLabel>
                {currentIndex + 1}/{questions.length}
              </StyledPagerLabel>
              <LightIconButton
                Icon={IconChevronRightPipe}
                size="small"
                disabled={isLastQuestion}
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(questions.length - 1, index + 1),
                  )
                }
              />
            </StyledPager>
          )}
        </StyledQuestionHeaderRow>

        <StyledOptionsList>
          {currentQuestion.options.map((option, optionIndex) => {
            const NumberIcon =
              NUMBER_ICONS[optionIndex] ??
              NUMBER_ICONS[NUMBER_ICONS.length - 1];
            const isSelected = (
              selectedByQuestion[currentIndex] ?? []
            ).includes(optionIndex);
            const hasSelection =
              (selectedByQuestion[currentIndex] ?? []).length > 0;
            const isHighlighted =
              isSelected || (!hasSelection && option.isRecommended === true);
            const tooltipId = `ask-question-option-${toolCallId}-${currentIndex}-${optionIndex}`;

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
                    <TextWithRecordLinks text={option.label} />
                  </StyledOptionLabel>
                  {option.isRecommended === true && (
                    <StyledRecommended>· {t`Recommended`}</StyledRecommended>
                  )}
                </StyledOptionLeft>
                {isDefined(option.description) && (
                  <>
                    <span
                      id={tooltipId}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <LightIconButton
                        Icon={IconInfoCircle}
                        size="small"
                        accent="tertiary"
                      />
                    </span>
                    <AppTooltip
                      anchorSelect={`#${tooltipId}`}
                      content={option.description}
                      delay={TooltipDelay.shortDelay}
                      place="left"
                    />
                  </>
                )}
              </StyledOptionRow>
            );
          })}
        </StyledOptionsList>
      </StyledQuestionSection>

      <StyledDivider />

      <StyledComposerSection>
        <StyledFreeTextArea
          value={freeTextByQuestion[currentIndex] ?? ''}
          placeholder={t`Type anything to do differently.`}
          onChange={(event) =>
            setFreeTextByQuestion((previous) => ({
              ...previous,
              [currentIndex]: event.target.value,
            }))
          }
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <StyledActionsRow>
          <StyledLeftActions>
            <AgentChatFileUploadButton />
            <AiChatContextUsageButton />
          </StyledLeftActions>
          <StyledRightActions>
            <Select
              dropdownId="ai-chat-question-model-select"
              value={selectedModelId}
              onChange={setAgentChatUserSelectedModel}
              options={modelOptions}
              pinnedOption={defaultPinnedOption}
              disabled={hasNoEnabledModels}
              selectSizeVariant="small"
              showContextualTextInControl={false}
              withSearchInput
              dropdownOffset={{ x: 0, y: 8 }}
            />
            <RoundedIconButton
              Icon={IconArrowUp}
              size="medium"
              onClick={handleSend}
              disabled={!allQuestionsAnswered || isSubmitting}
            />
          </StyledRightActions>
        </StyledActionsRow>
      </StyledComposerSection>
    </StyledCard>
  );
};
