import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconArchive, IconComment } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
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

const StyledArchivedNavigationDrawerItem = styled(NavigationDrawerItem)`
  && {
    color: ${themeCssVariables.font.color.tertiary};
  }
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
  const ThreadIcon = isArchived ? IconArchive : IconComment;
  const NavigationDrawerThreadItem = isArchived
    ? StyledArchivedNavigationDrawerItem
    : NavigationDrawerItem;
  const displayLabel = thread.title || t`New chat`;
  const timestamp = beautifyPastDateRelativeToNowShort(
    thread.updatedAt ?? thread.createdAt,
  );

  if (isRenaming) {
    return (
      <NavigationDrawerInput
        Icon={ThreadIcon}
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
      <NavigationDrawerThreadItem
        label={displayLabel}
        Icon={ThreadIcon}
        active={isActive}
        onClick={() => onClick(thread)}
        variant={isArchived ? 'tertiary' : 'default'}
        alwaysShowRightOptions
        rightOptions={
          <StyledRightOptions>
            <StyledTimestamp>{timestamp}</StyledTimestamp>
            <AiChatThreadItemMenu
              threadId={thread.id}
              isArchived={isArchived}
              surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
              onRenameRequested={startRename}
            />
          </StyledRightOptions>
        }
      />
      <AiChatThreadDeleteConfirmationModal
        threadId={thread.id}
        threadTitle={displayLabel}
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
      />
    </>
  );
};
