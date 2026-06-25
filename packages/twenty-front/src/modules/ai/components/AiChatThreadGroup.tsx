import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledThreadsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDateGroup = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

type AiChatThreadGroupProps = {
  alwaysShowRightIcon?: boolean;
  rightIcon?: ReactNode;
  threads: AgentChatThread[];
  title: string;
};

export const AiChatThreadGroup = ({
  alwaysShowRightIcon = false,
  rightIcon,
  threads,
  title,
}: AiChatThreadGroupProps) => {
  if (threads.length === 0) {
    return null;
  }

  return (
    <StyledDateGroup>
      <NavigationDrawerSectionTitle
        label={title}
        alwaysShowRightIcon={alwaysShowRightIcon}
        rightIcon={rightIcon}
      />
      <StyledThreadsList>
        {threads.map((thread) => (
          <AiChatThreadListItem key={thread.id} thread={thread} />
        ))}
      </StyledThreadsList>
    </StyledDateGroup>
  );
};
