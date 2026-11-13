import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxThreadCompactContent } from '@/ai/components/AiChatThreadCompactContent';
import { type InboxThreadListVariant } from '@/ai/types/AiChatThreadListVariant';

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  line-height: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

const StyledTitle = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
`;

type InboxThreadRowContentProps = {
  variant: InboxThreadListVariant;
  title: ReactNode;
  subtitle: ReactNode;
  activityTime: ReactNode;
  isStreaming: boolean;
};

export const InboxThreadRowContent = ({
  variant,
  title,
  subtitle,
  activityTime,
  isStreaming,
}: InboxThreadRowContentProps) => {
  if (variant === 'compact') {
    return (
      <InboxThreadCompactContent
        title={title}
        subtitle={subtitle}
        isStreaming={isStreaming}
      />
    );
  }

  return (
    <StyledHeading>
      <StyledTitle>{title}</StyledTitle>
      {activityTime}
    </StyledHeading>
  );
};
