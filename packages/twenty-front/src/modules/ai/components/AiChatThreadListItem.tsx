import { styled } from '@linaria/react';
import { type MouseEvent, useId } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadActionsDropdown } from '@/ai/components/AiChatThreadActionsDropdown';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAgentChatThreadMembers } from '@/ai/hooks/useAgentChatThreadMembers';
import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { type CommandMenuDropdownTriggerEvent } from '@/command-menu-item/hooks/useOpenCommandMenuDropdownAtCursor';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { VisibilityHidden } from 'twenty-ui/primitives/accessibility';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useFormatAgentChatThreadDate } from '@/ai/hooks/useFormatAgentChatThreadDate';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { getAgentChatThreadPreviewText } from '@/ai/utils/getAgentChatThreadPreviewText';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { WorkspaceMemberAvatarStack } from '@/workspace-member/components/WorkspaceMemberAvatarStack';

const StyledThreadItem = styled.div<{ $isSelected: boolean }>`
  align-items: flex-start;
  background: ${({ $isSelected }) =>
    $isSelected ? themeCssVariables.background.transparent.light : 'none'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  position: relative;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledLeading = styled.div`
  display: flex;
  flex-shrink: 0;
  padding-top: ${themeCssVariables.spacing['0.5']};
  width: ${themeCssVariables.spacing[10]};
`;

const StyledThreadContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledThreadHeading = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[5]};
  min-width: 0;
`;

const StyledThreadTitle = styled.div<{ $isUnread: boolean }>`
  color: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledThreadPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: ${themeCssVariables.spacing[4]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActivityTime = styled.div<{ $isDropdownOpen: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  visibility: ${({ $isDropdownOpen }) =>
    $isDropdownOpen ? 'hidden' : 'visible'};

  ${StyledThreadItem}:hover & {
    visibility: hidden;
  }
`;

const StyledMenuTrigger = styled.div<{ $isDropdownOpen: boolean }>`
  opacity: ${({ $isDropdownOpen }) => ($isDropdownOpen ? 1 : 0)};
  pointer-events: ${({ $isDropdownOpen }) =>
    $isDropdownOpen ? 'auto' : 'none'};
  position: absolute;
  right: ${themeCssVariables.spacing[1]};
  top: ${themeCssVariables.spacing[1]};
  transition: opacity 150ms;

  ${StyledThreadItem}:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

type AiChatThreadListItemProps = {
  thread: AgentChatThreadRecord;
  isSelected: boolean;
  onClick: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onContextMenu?: (
    thread: AgentChatThreadRecord,
    event: CommandMenuDropdownTriggerEvent,
  ) => void;
  onDetach?: () => void;
};

export const AiChatThreadListItem = ({
  thread,
  isSelected,
  onClick,
  onContextMenu,
  onDetach,
}: AiChatThreadListItemProps) => {
  const { t } = useLingui();
  const actionsInstanceId = useId();
  const commandMenuInstanceIdFromContext = useAvailableComponentInstanceId(
    CommandMenuComponentInstanceContext,
  );

  // A list with a context menu opens it from "..." too, so both show the
  // same items
  const sharedCommandMenuInstanceId = isDefined(onContextMenu)
    ? commandMenuInstanceIdFromContext
    : undefined;

  const commandMenuInstanceId =
    sharedCommandMenuInstanceId ?? actionsInstanceId;

  const { isRenaming, draftTitle, setDraftTitle, cancelRename, commitRename } =
    useAiChatThreadRename({ thread, commandMenuInstanceId });

  const { isUnread, event } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    thread.id,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const threadMembers = useAgentChatThreadMembers(thread);
  const isShownAsUnread = !isDefined(thread.deletedAt) && isUnread;
  const previewText = getAgentChatThreadPreviewText({
    thread,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
  });
  const displayTitle = isNonEmptyString(thread.title)
    ? thread.title
    : t`Untitled`;
  const { formatAgentChatThreadDay } = useFormatAgentChatThreadDate();

  const getActivityTimeLabel = () => {
    switch (event?.type) {
      case 'SNOOZED': {
        const snoozedUntilDay = formatAgentChatThreadDay(new Date(event.at));

        return t`Until ${snoozedUntilDay}`;
      }
      case 'SNOOZE_ENDED':
        return t`Snooze ended`;
      case 'DONE': {
        const doneTime = beautifyPastDateRelativeToNowShort(event.at);

        return t`Done ${doneTime}`;
      }
      default:
        return beautifyPastDateRelativeToNowShort(
          getAgentChatThreadLastActivityAt(thread),
        );
    }
  };
  const isCommandMenuDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    getCommandMenuDropdownIdFromCommandMenuId(commandMenuInstanceId),
  );

  // The shared menu opens on the selected chats, so only they keep "..." shown
  const isDropdownOpen =
    isCommandMenuDropdownOpen &&
    (!isDefined(sharedCommandMenuInstanceId) || isSelected);
  return (
    <StyledThreadItem
      $isSelected={isSelected}
      data-selectable-id={thread.id}
      data-select-disable={isRenaming || undefined}
      onMouseDown={(event) => {
        // Shift+click selects a range of chats, not the text in between
        if (event.shiftKey && !isRenaming) {
          event.preventDefault();
        }
      }}
      onClick={(event) => {
        if (!isRenaming) {
          onClick(thread, event);
        }
      }}
      onContextMenu={(event) => {
        if (!isRenaming) {
          onContextMenu?.(thread, event);
        }
      }}
    >
      <StyledLeading>
        <WorkspaceMemberAvatarStack
          workspaceMembers={threadMembers}
          defaultAvatarName={t`Member`}
          maxVisible={2}
        />
      </StyledLeading>
      <StyledThreadContent>
        {isRenaming ? (
          <TextInput
            value={draftTitle}
            onChange={setDraftTitle}
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.target.select()}
            onBlur={() => commitRename(draftTitle)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229) {
                return;
              }
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
          <StyledThreadHeading>
            <StyledThreadTitle $isUnread={isShownAsUnread}>
              {displayTitle}
              {isShownAsUnread && (
                <VisibilityHidden>{t`, unread`}</VisibilityHidden>
              )}
            </StyledThreadTitle>
            <StyledActivityTime $isDropdownOpen={isDropdownOpen}>
              {getActivityTimeLabel()}
            </StyledActivityTime>
          </StyledThreadHeading>
        )}
        <StyledThreadPreview>{previewText}</StyledThreadPreview>
      </StyledThreadContent>
      <StyledMenuTrigger
        $isDropdownOpen={isDropdownOpen}
        onClick={(event) => event.stopPropagation()}
      >
        {isDefined(sharedCommandMenuInstanceId) ? (
          <LightIconButton
            aria-label={t`Chat actions`}
            emphasis="subtle"
            onClick={(event) => {
              const { left, bottom } =
                event.currentTarget.getBoundingClientRect();

              onContextMenu?.(thread, {
                preventDefault: () => event.preventDefault(),
                clientX: left,
                clientY: bottom,
              });
            }}
          >
            <IconDotsVertical />
          </LightIconButton>
        ) : (
          <AiChatThreadActionsDropdown
            thread={thread}
            instanceId={actionsInstanceId}
            onDetach={onDetach}
          />
        )}
      </StyledMenuTrigger>
    </StyledThreadItem>
  );
};
