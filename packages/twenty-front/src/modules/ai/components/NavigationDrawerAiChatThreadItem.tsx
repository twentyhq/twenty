import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconArchive, IconComment } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadItemMenu } from '@/ai/components/AiChatThreadItemMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledRightOptions = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: flex-end;
  min-width: ${themeCssVariables.spacing[6]};
  position: relative;
`;

const StyledTimestamp = styled.span<{ $isDropdownOpen: boolean }>`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  opacity: ${({ $isDropdownOpen }) => ($isDropdownOpen ? 0 : 1)};
  transition: opacity 150ms;

  .navigation-drawer-item:hover & {
    opacity: 0;
  }
`;

const StyledMenuTrigger = styled.div<{ $isDropdownOpen: boolean }>`
  opacity: ${({ $isDropdownOpen }) => ($isDropdownOpen ? 1 : 0)};
  pointer-events: ${({ $isDropdownOpen }) =>
    $isDropdownOpen ? 'auto' : 'none'};
  position: absolute;
  right: 0;
  top: 0;
  transition: opacity 150ms;

  .navigation-drawer-item:hover & {
    opacity: 1;
    pointer-events: auto;
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

  const isArchived = Boolean(thread.deletedAt);
  const ThreadIcon = isArchived ? IconArchive : IconComment;
  const displayLabel = thread.title || t`New chat`;
  const timestamp = beautifyPastDateRelativeToNowShort(
    thread.lastMessageAt ?? thread.updatedAt ?? thread.createdAt,
  );
  const itemMenuDropdownId = getAiChatThreadItemMenuDropdownId(
    thread.id,
    AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER,
  );
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    itemMenuDropdownId,
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
    <NavigationDrawerItem
      label={displayLabel}
      Icon={ThreadIcon}
      active={isActive}
      onClick={() => onClick(thread)}
      variant={isArchived ? 'tertiary' : 'default'}
      alwaysShowRightOptions
      rightOptions={
        <StyledRightOptions>
          <StyledTimestamp $isDropdownOpen={isDropdownOpen}>
            {timestamp}
          </StyledTimestamp>
          <StyledMenuTrigger $isDropdownOpen={isDropdownOpen}>
            <AiChatThreadItemMenu
              threadId={thread.id}
              threadTitle={displayLabel}
              isArchived={isArchived}
              surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
              onRenameRequested={startRename}
            />
          </StyledMenuTrigger>
        </StyledRightOptions>
      }
    />
  );
};
