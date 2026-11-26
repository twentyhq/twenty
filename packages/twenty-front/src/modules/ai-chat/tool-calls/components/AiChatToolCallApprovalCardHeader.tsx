import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { TextWithChatReferences } from '@/ai-chat/message-content/components/TextWithChatReferences';

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledTitle = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSummary = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  overflow-wrap: anywhere;
`;

type AiChatToolCallApprovalCardHeaderProps = {
  title: string;
  Icon?: IconComponent;
  summary?: string;
};

export const AiChatToolCallApprovalCardHeader = ({
  title,
  Icon,
  summary,
}: AiChatToolCallApprovalCardHeaderProps) => {
  const theme = useTheme();

  return (
    <StyledHeader>
      <StyledTitleRow>
        {isDefined(Icon) && <Icon size={theme.icon.size.md} />}
        <StyledTitle>{title}</StyledTitle>
      </StyledTitleRow>
      {isDefined(summary) && (
        <StyledSummary>
          <TextWithChatReferences text={summary} />
        </StyledSummary>
      )}
    </StyledHeader>
  );
};
