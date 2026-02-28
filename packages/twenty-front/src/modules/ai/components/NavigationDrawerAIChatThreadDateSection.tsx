import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconComment } from 'twenty-ui/display';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledDateSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDateHeader = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0, 2)};
`;

const StyledThreadTimestamp = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
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
