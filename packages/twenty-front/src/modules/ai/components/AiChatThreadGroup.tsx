import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useDeleteAgentChatThread } from '@/ai/hooks/useDeleteAgentChatThread';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useContext, useState } from 'react';
import { IconCheck, IconSparkles, IconTrash, IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
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

const StyledThreadItem = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  border-left: 3px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 1px;
  position: relative;
  right: 3px;
  transition: all 0.2s ease;
  width: calc(100% + 1px);

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:hover .thread-delete-button {
    opacity: 1;
  }
`;

const StyledDeleteButton = styled.div<{ $isConfirming?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
  margin-right: ${themeCssVariables.spacing[1]};
  opacity: ${({ $isConfirming }) => ($isConfirming ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const StyledSparkleIcon = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledThreadContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledThreadTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AiChatThreadGroup = ({
  threads,
  title,
}: {
  threads: AgentChatThread[];
  title: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { handleThreadClick } = useAiChatThreadClick();
  const { deleteThread } = useDeleteAgentChatThread();

  // Thread currently in inline confirm-in-place state (only one at a time).
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

  if (threads.length === 0) {
    return null;
  }

  return (
    <StyledDateGroup>
      <StyledDateHeader>{title}</StyledDateHeader>
      <StyledThreadsList>
        {threads.map((thread) => {
          const isPendingDelete = pendingDeleteThreadId === thread.id;
          return (
            <StyledThreadItem
              onClick={() => handleThreadClick(thread)}
              key={thread.id}
            >
              <StyledSparkleIcon>
                <IconSparkles
                  size={theme.icon.size.md}
                  color={theme.color.blue}
                />
              </StyledSparkleIcon>
              <StyledThreadContent>
                <StyledThreadTitle>
                  {thread.title || t`Untitled`}
                </StyledThreadTitle>
              </StyledThreadContent>
              <StyledDeleteButton
                className="thread-delete-button"
                $isConfirming={isPendingDelete}
              >
                {isPendingDelete ? (
                  <>
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
                  </>
                ) : (
                  <LightIconButton
                    Icon={IconTrash}
                    accent="tertiary"
                    size="small"
                    onClick={(event) => handleTrashClick(event, thread)}
                    aria-label={t`Delete chat`}
                  />
                )}
              </StyledDeleteButton>
            </StyledThreadItem>
          );
        })}
      </StyledThreadsList>
    </StyledDateGroup>
  );
};
