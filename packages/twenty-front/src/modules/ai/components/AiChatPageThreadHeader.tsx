import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical, IconPlus } from 'twenty-ui/icon';
import { Button, IconButton } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  max-width: 100%;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
  width: fit-content;
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
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);
  const displayTitle = thread.title || t`New chat`;
  const agentChatHasMessage = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );
  const hasConversation =
    agentChatHasMessage || isDefined(thread.lastMessageAt);

  return (
    <>
      <StyledTitle>
        {isRenaming ? (
          <TitleInput
            instanceId={`ai-chat-page-thread-title-${thread.id}`}
            value={draftTitle}
            onChange={setDraftTitle}
            onEnter={() => commitRename(draftTitle)}
            onEscape={cancelRename}
            onClickOutside={() => commitRename(draftTitle)}
            placeholder={t`Chat name`}
            sizeVariant="sm"
            shouldFocus
          />
        ) : (
          <OverflowingTextWithTooltip text={displayTitle} />
        )}
      </StyledTitle>
      <StyledActions>
        {hasConversation && (
          <Button
            Icon={IconPlus}
            title={t`New chat`}
            size="small"
            variant="primary"
            accent="blue"
            onClick={() => switchToNewChat()}
          />
        )}
        <AiChatThreadItemMenu
          threadId={thread.id}
          threadTitle={displayTitle}
          isArchived={Boolean(thread.deletedAt)}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.PAGE_HEADER}
          onRenameRequested={startRename}
          clickableComponent={
            <IconButton
              Icon={IconDotsVertical}
              size="small"
              variant="secondary"
              ariaLabel={t`Chat actions`}
            />
          }
        />
      </StyledActions>
    </>
  );
};
