import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconComment } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

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

const StyledThreadTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  padding-right: ${themeCssVariables.spacing['0.5']};
`;

export type NavigationDrawerAIChatThreadDateSectionProps = {
  title: string;
  threads: AgentChatThread[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThread) => void;
};

export const NavigationDrawerAIChatThreadDateSection = ({
  title,
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerAIChatThreadDateSectionProps) => {
  const { t } = useLingui();

  return (
    <StyledDateSection>
      <StyledDateHeader>{title}</StyledDateHeader>
      <StyledThreadList>
        {threads.map((thread) => {
          const isActive = currentThreadId === thread.id;
          const timestamp = beautifyPastDateRelativeToNowShort(
            thread.updatedAt ?? thread.createdAt,
          );
          return (
            <NavigationDrawerItem
              key={thread.id}
              label={thread.title || t`New chat`}
              Icon={IconComment}
              active={isActive}
              onClick={() => onThreadClick(thread)}
              alwaysShowRightOptions
              rightOptions={
                <StyledThreadTimestamp>{timestamp}</StyledThreadTimestamp>
              }
            />
          );
        })}
      </StyledThreadList>
    </StyledDateSection>
  );
};
