import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { IconArchive, IconSparkles } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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

const StyledThreadIcon = styled.div<{ $isArchived: boolean }>`
  align-items: center;
  background: ${({ $isArchived }) =>
    $isArchived
      ? themeCssVariables.background.transparent.lighter
      : themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ $isArchived }) =>
    $isArchived
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.color.blue};
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

const StyledMenuTrigger = styled.div<{ $isDropdownOpen: boolean }>`
  opacity: ${({ $isDropdownOpen }) => ($isDropdownOpen ? 1 : 0)};
  pointer-events: ${({ $isDropdownOpen }) =>
    $isDropdownOpen ? 'auto' : 'none'};
  position: absolute;
  right: ${themeCssVariables.spacing[1]};
  top: 50%;
  transform: translateY(-50%);
  transition: opacity 150ms;

  ${StyledThreadItem}:hover & {
    opacity: 1;
    pointer-events: auto;
  }
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

  const isArchived = Boolean(thread.deletedAt);
  const ThreadIcon = isArchived ? IconArchive : IconSparkles;
  const displayTitle = thread.title ?? t`Untitled`;
  const itemMenuDropdownId = getAiChatThreadItemMenuDropdownId(
    thread.id,
    AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL,
  );
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    itemMenuDropdownId,
  );

  return (
    <StyledThreadItem
      onClick={() => {
        if (!isRenaming) {
          handleThreadClick(thread);
        }
      }}
    >
      <StyledThreadIcon $isArchived={isArchived}>
        <ThreadIcon size={theme.icon.size.md} color="currentColor" />
      </StyledThreadIcon>
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
      <StyledMenuTrigger
        $isDropdownOpen={isDropdownOpen}
        onClick={(event) => event.stopPropagation()}
      >
        <AiChatThreadItemMenu
          threadId={thread.id}
          threadTitle={displayTitle}
          isArchived={isArchived}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
          onRenameRequested={startRename}
        />
      </StyledMenuTrigger>
    </StyledThreadItem>
  );
};
