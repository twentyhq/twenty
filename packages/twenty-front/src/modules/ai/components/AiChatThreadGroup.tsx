import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledThreadsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDateGroup = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledDateHeader = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

export const AiChatThreadGroup = ({
  threads,
  title,
}: {
  threads: AgentChatThread[];
  title: string;
}) => {
  if (threads.length === 0) {
    return null;
  }

  return (
    <StyledDateGroup>
      <StyledDateHeader>{title}</StyledDateHeader>
      <StyledThreadsList>
        {threads.map((thread) => (
          <AiChatThreadListItem key={thread.id} thread={thread} />
        ))}
      </StyledThreadsList>
    </StyledDateGroup>
  );
};
