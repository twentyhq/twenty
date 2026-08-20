import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { Tag, type TagColor } from 'twenty-ui/data-display';
import { IconHelpCircle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAdminChatAskQuestionsQuestion } from '@/settings/admin-panel/components/SettingsAdminChatAskQuestionsQuestion';
import { SettingsAdminChatToolCallPart } from '@/settings/admin-panel/components/SettingsAdminChatToolCallPart';
import { type AdminAskQuestionsResult } from '@/settings/admin-panel/types/AdminAskQuestionsResult';
import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';

type SettingsAdminChatAskQuestionsPartProps = {
  part: AdminChatThreadMessagePart;
  result: AdminAskQuestionsResult;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCardHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};

  svg {
    flex-shrink: 0;
  }
`;

const StyledStatusTag = styled.div`
  margin-left: auto;
`;

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'answered':
      return t`Answered`;
    case 'skipped':
      return t`Skipped`;
    case 'pending':
      return t`Unanswered`;
    default:
      return status;
  }
};

const getStatusTagColor = (status: string): TagColor => {
  switch (status) {
    case 'answered':
      return 'green';
    case 'skipped':
      return 'gray';
    case 'pending':
      return 'orange';
    default:
      return 'gray';
  }
};

export const SettingsAdminChatAskQuestionsPart = ({
  part,
  result,
}: SettingsAdminChatAskQuestionsPartProps) => (
  <StyledContainer>
    <StyledCard>
      <StyledCardHeader>
        <IconHelpCircle size={14} />
        {t`Questions`}
        <StyledStatusTag>
          <Tag
            color={getStatusTagColor(result.status)}
            text={getStatusLabel(result.status)}
          />
        </StyledStatusTag>
      </StyledCardHeader>
      {result.questions.map((question, questionIndex) => (
        <SettingsAdminChatAskQuestionsQuestion
          key={questionIndex}
          question={question}
          answer={result.answers?.find(
            (answer) => answer.questionIndex === questionIndex,
          )}
        />
      ))}
    </StyledCard>
    <SettingsAdminChatToolCallPart part={part} />
  </StyledContainer>
);
