import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { IconSparkles } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SCOPE_ID } from '@/ai/constants/AiChatThreadActionsScopeId';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { TextInput } from '@/ui/input/components/TextInput';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledThreadItem = styled.div`
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

const StyledMenuTrigger = styled.div`
  flex-shrink: 0;
`;

type AiChatThreadListItemProps = {
  thread: AgentChatThread;
};

export const AiChatThreadListItem = ({ thread }: AiChatThreadListItemProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { handleThreadClick } = useAiChatThreadClick();
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);

  const isArchived = Boolean(thread.archivedAt);
  const displayTitle = thread.title ?? t`Untitled`;

  return (
    <>
      <StyledThreadItem
        onClick={() => {
          if (!isRenaming) {
            handleThreadClick(thread);
          }
        }}
      >
        <StyledSparkleIcon>
          <IconSparkles size={theme.icon.size.md} color={theme.color.blue} />
        </StyledSparkleIcon>
        <StyledThreadContent>
          {isRenaming ? (
            <TextInput
              value={draftTitle}
              onChange={setDraftTitle}
              onClick={(event) => event.stopPropagation()}
              onFocus={(event) => event.target.select()}
              onBlur={() => commitRename(draftTitle)}
              onKeyDown={(event) => {
                if (event.key === Key.Enter) {
                  event.preventDefault();
                  void commitRename(draftTitle);
                } else if (event.key === Key.Escape) {
                  event.preventDefault();
                  cancelRename();
                }
              }}
              sizeVariant="sm"
              fullWidth
              autoFocus
              aria-label={t`Rename chat`}
            />
          ) : (
            <StyledThreadTitle>{displayTitle}</StyledThreadTitle>
          )}
        </StyledThreadContent>
        <StyledMenuTrigger onClick={(event) => event.stopPropagation()}>
          <AiChatThreadItemMenu
            threadId={thread.id}
            isArchived={isArchived}
            scopeId={AI_CHAT_THREAD_ACTIONS_SCOPE_ID.SIDE_PANEL}
            onRenameRequested={startRename}
          />
        </StyledMenuTrigger>
      </StyledThreadItem>
      <AiChatThreadDeleteConfirmationModal
        threadId={thread.id}
        threadTitle={displayTitle}
        scopeId={AI_CHAT_THREAD_ACTIONS_SCOPE_ID.SIDE_PANEL}
      />
    </>
  );
};
