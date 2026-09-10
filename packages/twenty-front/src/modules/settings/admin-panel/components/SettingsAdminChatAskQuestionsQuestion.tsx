import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { isNonEmptyString } from '@sniptt/guards';
import { type AskQuestionAnswer, type AskQuestionItem } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { IconCheck } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';

type SettingsAdminChatAskQuestionsQuestionProps = {
  question: AskQuestionItem;
  answer: AskQuestionAnswer | undefined;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeaderRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMultiSelectHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledQuestionText = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  margin: 0;
  overflow-wrap: anywhere;
`;

const StyledOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledOptionRow = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledOptionLabelRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.4;
  overflow-wrap: anywhere;

  svg {
    color: ${themeCssVariables.color.blue};
    flex-shrink: 0;
  }
`;

const StyledRecommended = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
`;

const StyledOptionDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

export const SettingsAdminChatAskQuestionsQuestion = ({
  question,
  answer,
}: SettingsAdminChatAskQuestionsQuestionProps) => {
  const selectedOptionIndices = new Set(answer?.selectedOptionIndices ?? []);
  const freeText = answer?.freeText ?? '';

  return (
    <StyledContainer>
      <StyledHeaderRow>
        {isNonEmptyString(question.header) && (
          <Tag color="transparent" text={question.header} variant="border" />
        )}
        {question.allowMultiSelect === true && (
          <StyledMultiSelectHint>{t`Multiple answers`}</StyledMultiSelectHint>
        )}
      </StyledHeaderRow>
      <StyledQuestionText>
        <TextWithChatReferences text={question.question} />
      </StyledQuestionText>
      <StyledOptionsList>
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedOptionIndices.has(optionIndex);

          return (
            <StyledOptionRow key={optionIndex} isSelected={isSelected}>
              <StyledOptionLabelRow>
                {isSelected && <IconCheck size={14} />}
                <TextWithChatReferences text={option.label} />
                {option.isRecommended === true && (
                  <StyledRecommended>· {t`Recommended`}</StyledRecommended>
                )}
              </StyledOptionLabelRow>
              {isDefined(option.description) && (
                <StyledOptionDescription>
                  <TextWithChatReferences text={option.description} />
                </StyledOptionDescription>
              )}
            </StyledOptionRow>
          );
        })}
        {isNonEmptyString(freeText) && (
          <StyledOptionRow isSelected>
            <StyledOptionLabelRow>
              <IconCheck size={14} />
              {t`Other`}
            </StyledOptionLabelRow>
            <StyledOptionDescription>
              <TextWithChatReferences text={freeText} />
            </StyledOptionDescription>
          </StyledOptionRow>
        )}
      </StyledOptionsList>
    </StyledContainer>
  );
};
