import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconComment } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SCOPE_ID } from '@/ai/constants/AiChatThreadActionsScopeId';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledRightOptions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

type NavigationDrawerAiChatThreadItemProps = {
  thread: AgentChatThread;
  isActive: boolean;
  onClick: (thread: AgentChatThread) => void;
};

export const NavigationDrawerAiChatThreadItem = ({
  thread,
  isActive,
  onClick,
}: NavigationDrawerAiChatThreadItemProps) => {
  const { t } = useLingui();
  const {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  } = useAiChatThreadRename(thread);

  const isArchived = Boolean(thread.archivedAt);
  const displayLabel = thread.title || t`New chat`;
  const timestamp = beautifyPastDateRelativeToNowShort(
    thread.updatedAt ?? thread.createdAt,
  );

  if (isRenaming) {
    return (
      <NavigationDrawerInput
        Icon={IconComment}
        value={draftTitle}
        onChange={setDraftTitle}
        onSubmit={commitRename}
        onCancel={cancelRename}
        onClickOutside={(_event, value) => commitRename(value)}
        placeholder={t`Chat name`}
      />
    );
  }

  return (
    <>
      <NavigationDrawerItem
        label={displayLabel}
        Icon={IconComment}
        active={isActive}
        onClick={() => onClick(thread)}
        alwaysShowRightOptions
        rightOptions={
          <StyledRightOptions>
            <StyledTimestamp>{timestamp}</StyledTimestamp>
            <AiChatThreadItemMenu
              threadId={thread.id}
              isArchived={isArchived}
              scopeId={AI_CHAT_THREAD_ACTIONS_SCOPE_ID.NAV_DRAWER}
              onRenameRequested={startRename}
            />
          </StyledRightOptions>
        }
      />
      <AiChatThreadDeleteConfirmationModal
        threadId={thread.id}
        threadTitle={displayLabel}
        scopeId={AI_CHAT_THREAD_ACTIONS_SCOPE_ID.NAV_DRAWER}
      />
    </>
  );
};
