import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react';
import {
  type AskQuestionItem,
  type AskQuestionResponse,
} from 'twenty-shared/ai';
import { IconCheck } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { TextWithChatReferences } from '@/ai-chat/message-content/components/TextWithChatReferences';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';
import { getQuestionOptionNumberIcon } from '@/ai-chat/tool-calls/utils/getQuestionOptionNumberIcon';

const StyledQuestionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledQuestionText = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  margin: 0;
  min-height: ${themeCssVariables.spacing[6]};
  overflow-wrap: anywhere;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledOptionRow = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledOptionLabel = styled.span<{ isSelected: boolean }>`
  color: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const StyledDivider = styled.div`
  background: ${themeCssVariables.border.color.light};
  height: 1px;
  width: 100%;
`;

type AiChatQuestionAnsweredDetailsProps = {
  entries: { question: AskQuestionItem; answer?: AskQuestionResponse }[];
};

export const AiChatQuestionAnsweredDetails = ({
  entries,
}: AiChatQuestionAnsweredDetailsProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledAiChatAskCard>
      {entries.map(({ question, answer }, entryIndex) => {
        const selectedOptionIndices = answer?.selectedOptionIndices ?? [];
        const freeText = answer?.freeText?.trim();
        const OtherNumberIcon = getQuestionOptionNumberIcon(
          question.options.length,
        );

        return (
          <Fragment key={entryIndex}>
            {entryIndex > 0 && <StyledDivider />}
            <StyledQuestionSection>
              <StyledQuestionText>
                <TextWithChatReferences text={question.question} />
              </StyledQuestionText>
              <StyledOptionsList>
                {question.options.map((option, optionIndex) => {
                  const NumberIcon = getQuestionOptionNumberIcon(optionIndex);
                  const isSelected =
                    selectedOptionIndices.includes(optionIndex);

                  return (
                    <StyledOptionRow key={optionIndex} isSelected={isSelected}>
                      <NumberIcon
                        size={theme.icon.size.sm}
                        color={themeCssVariables.font.color.tertiary}
                      />
                      <StyledOptionLabel isSelected={isSelected}>
                        <TextWithChatReferences text={option.label} />
                      </StyledOptionLabel>
                      {isSelected && (
                        <IconCheck
                          size={theme.icon.size.sm}
                          aria-label={t`Selected`}
                        />
                      )}
                    </StyledOptionRow>
                  );
                })}
                {isNonEmptyString(freeText) && (
                  <StyledOptionRow isSelected>
                    <OtherNumberIcon
                      size={theme.icon.size.sm}
                      color={themeCssVariables.font.color.tertiary}
                    />
                    <StyledOptionLabel isSelected>
                      <TextWithChatReferences text={freeText} />
                    </StyledOptionLabel>
                    <IconCheck
                      size={theme.icon.size.sm}
                      aria-label={t`Selected`}
                    />
                  </StyledOptionRow>
                )}
              </StyledOptionsList>
            </StyledQuestionSection>
          </Fragment>
        );
      })}
    </StyledAiChatAskCard>
  );
};
