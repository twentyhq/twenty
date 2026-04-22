import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useState } from 'react';
import { IconCheck, IconComment, IconTrash, IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useDeleteAgentChatThread } from '@/ai/hooks/useDeleteAgentChatThread';
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

const StyledRightOptions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
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
  const { t } = useLingui();
  const { deleteThread } = useDeleteAgentChatThread();

  // Thread id currently in the inline confirm-in-place state.
  // Only one thread can be pending at a time across this section.
  const [pendingDeleteThreadId, setPendingDeleteThreadId] = useState<
    string | null
  >(null);

  const handleTrashClick = (
    event: MouseEvent<HTMLButtonElement>,
    thread: AgentChatThread,
  ) => {
    event.stopPropagation();
    setPendingDeleteThreadId(thread.id);
  };

  const handleConfirmClick = async (
    event: MouseEvent<HTMLButtonElement>,
    thread: AgentChatThread,
  ) => {
    event.stopPropagation();
    setPendingDeleteThreadId(null);
    await deleteThread(thread.id);
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPendingDeleteThreadId(null);
  };

  return (
    <StyledDateSection>
      <StyledDateHeader>{title}</StyledDateHeader>
      <StyledThreadList>
        {threads.map((thread) => {
          const isActive = currentThreadId === thread.id;
          const isPendingDelete = pendingDeleteThreadId === thread.id;
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
                isPendingDelete ? (
                  <StyledRightOptions>
                    <LightIconButton
                      Icon={IconCheck}
                      accent="tertiary"
                      size="small"
                      onClick={(event) => handleConfirmClick(event, thread)}
                      aria-label={t`Confirm delete`}
                    />
                    <LightIconButton
                      Icon={IconX}
                      accent="tertiary"
                      size="small"
                      onClick={handleCancelClick}
                      aria-label={t`Cancel delete`}
                    />
                  </StyledRightOptions>
                ) : (
                  <StyledRightOptions>
                    <StyledThreadTimestamp>{timestamp}</StyledThreadTimestamp>
                    <LightIconButton
                      Icon={IconTrash}
                      accent="tertiary"
                      size="small"
                      onClick={(event) => handleTrashClick(event, thread)}
                      aria-label={t`Delete chat`}
                    />
                  </StyledRightOptions>
                )
              }
            />
          );
        })}
      </StyledThreadList>
    </StyledDateSection>
  );
};
