import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledDateSection = styled.section`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledDateHeader = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
`;

export type NavigationDrawerAiChatThreadDateSectionProps = {
  title: string;
  threads: AgentChatThread[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThread) => void;
};

export const NavigationDrawerAiChatThreadDateSection = ({
  title,
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerAiChatThreadDateSectionProps) => {
  return (
    <StyledDateSection>
      <StyledDateHeader>{title}</StyledDateHeader>
      <StyledThreadList>
        {threads.map((thread) => (
          <NavigationDrawerAiChatThreadItem
            key={thread.id}
            thread={thread}
            isActive={currentThreadId === thread.id}
            onClick={onThreadClick}
          />
        ))}
      </StyledThreadList>
    </StyledDateSection>
  );
};
