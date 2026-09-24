import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconDotsVertical, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  max-width: 100%;
  min-width: 0;
  width: fit-content;
`;

const StyledTitleDisplay = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 24px;
  overflow: hidden;
  padding: 0 5px;

  &:hover,
  &:focus-visible {
    background: ${themeCssVariables.background.transparent.light};
    outline: none;
  }
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

type AiChatPageThreadHeaderProps = {
  thread: AgentChatThread;
};

export const AiChatPageThreadHeader = ({
  thread,
}: AiChatPageThreadHeaderProps) => {
  const { t } = useLingui();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const currentAiChatThreadTitle = useAtomComponentFamilyStateValue(
    currentAiChatThreadTitleComponentFamilyState,
    { threadId: thread.id },
  );
  const title = thread.title ?? currentAiChatThreadTitle;
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename({ ...thread, title });
  const displayTitle = title || t`New chat`;
  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: thread.id },
  );
  const hasConversation =
    agentChatMessages.length > 0 || isDefined(thread.lastMessageAt);

  return (
    <>
      <StyledTitle>
        {isRenaming ? (
          <TextInput
            value={draftTitle}
            onChange={setDraftTitle}
            onFocus={(event) => event.target.select()}
            onBlur={() => commitRename(draftTitle)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229) {
                return;
              }
              if (event.key === Key.Enter) {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.blur();
              } else if (event.key === Key.Escape) {
                event.preventDefault();
                event.stopPropagation();
                cancelRename();
              }
            }}
            placeholder={t`Chat name`}
            sizeVariant="sm"
            autoGrow
            inheritFontStyles
            autoFocus
          />
        ) : (
          <StyledTitleDisplay
            role="button"
            tabIndex={0}
            aria-label={t`Rename chat`}
            onClick={startRename}
            onKeyDown={(event) => {
              if (event.key === Key.Enter || event.key === ' ') {
                event.preventDefault();
                startRename();
              }
            }}
          >
            <OverflowingTextWithTooltip text={displayTitle} />
          </StyledTitleDisplay>
        )}
      </StyledTitle>
      <StyledActions>
        {hasConversation && (
          <Button
            startIcon={<IconPlus />}
            size="sm"
            onClick={() => switchToNewChat()}
            variant="solid"
            color="accent"
          >{t`New chat`}</Button>
        )}
        <AiChatThreadItemMenu
          threadId={thread.id}
          threadTitle={displayTitle}
          isArchived={Boolean(thread.deletedAt)}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.PAGE_HEADER}
          onRenameRequested={startRename}
          trigger={
            <IconButton
              size="sm"
              variant="outline"
              aria-label={t`Chat actions`}
            >
              <IconDotsVertical />
            </IconButton>
          }
        />
      </StyledActions>
    </>
  );
};
