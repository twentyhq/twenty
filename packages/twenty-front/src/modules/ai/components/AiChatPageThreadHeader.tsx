import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
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
import { TextInput } from '@/ui/input/components/TextInput';
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
