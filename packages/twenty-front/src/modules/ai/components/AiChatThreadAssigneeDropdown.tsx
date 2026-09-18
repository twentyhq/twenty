import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconUserCircle, IconUserPlus, IconX } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useAiChatThreadAssignee } from '@/ai/hooks/useAiChatThreadAssignee';
import { useChatThreadInboxActions } from '@/ai/hooks/useChatThreadInboxActions';
import { getWorkspaceMemberFullName } from '@/ai/utils/getWorkspaceMemberFullName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const getAiChatThreadAssigneeDropdownId = (threadId: string) =>
  `ai-chat-thread-assignee-${threadId}`;

const StyledClickableContainer = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledAssigneeName = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type AiChatThreadAssigneeDropdownProps = {
  threadId: string;
};

export const AiChatThreadAssigneeDropdown = ({
  threadId,
}: AiChatThreadAssigneeDropdownProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { assignChatThread } = useChatThreadInboxActions();
  const { assignableWorkspaceMembers, assigneeWorkspaceMember } =
    useAiChatThreadAssignee(threadId);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const dropdownId = getAiChatThreadAssigneeDropdownId(threadId);

  const isAssignedToCurrentUser =
    isDefined(assigneeWorkspaceMember) &&
    assigneeWorkspaceMember.userWorkspaceId ===
      currentWorkspaceMember?.userWorkspaceId;

  const assign = (assigneeUserWorkspaceId: string | null) => {
    void assignChatThread(threadId, assigneeUserWorkspaceId);
    closeDropdown(dropdownId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <StyledClickableContainer
          role="button"
          aria-label={
            isDefined(assigneeWorkspaceMember)
              ? t`Assigned to ${getWorkspaceMemberFullName(assigneeWorkspaceMember)}`
              : t`Assign chat`
          }
        >
          {isDefined(assigneeWorkspaceMember) ? (
            <>
              <Avatar
                src={assigneeWorkspaceMember.avatarUrl}
                name={getWorkspaceMemberFullName(assigneeWorkspaceMember)}
                colorSeed={assigneeWorkspaceMember.id}
                size="sm"
                shape="circle"
              />
              <StyledAssigneeName>
                {getWorkspaceMemberFullName(assigneeWorkspaceMember)}
              </StyledAssigneeName>
            </>
          ) : (
            <IconUserCircle size={14} />
          )}
        </StyledClickableContainer>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
          <DropdownMenuHeader>{t`Assign to`}</DropdownMenuHeader>
          <DropdownMenuItemsContainer hasMaxHeight>
            {!isAssignedToCurrentUser &&
              isDefined(currentWorkspaceMember?.userWorkspaceId) && (
                <MenuItem
                  LeftIcon={IconUserPlus}
                  text={t`Assign to me`}
                  onClick={() =>
                    assign(currentWorkspaceMember.userWorkspaceId ?? null)
                  }
                />
              )}
            {assignableWorkspaceMembers.map((workspaceMember) => (
              <MenuItemAvatar
                key={workspaceMember.id}
                text={getWorkspaceMemberFullName(workspaceMember)}
                contextualText={
                  workspaceMember.userWorkspaceId ===
                  assigneeWorkspaceMember?.userWorkspaceId
                    ? t`Assigned`
                    : undefined
                }
                avatar={{
                  src: workspaceMember.avatarUrl,
                  name: getWorkspaceMemberFullName(workspaceMember),
                  colorSeed: workspaceMember.id,
                  size: 'md',
                  shape: 'circle',
                }}
                onClick={() => assign(workspaceMember.userWorkspaceId ?? null)}
              />
            ))}
          </DropdownMenuItemsContainer>
          {isDefined(assigneeWorkspaceMember) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer>
                <MenuItem
                  LeftIcon={IconX}
                  text={t`Unassign`}
                  onClick={() => assign(null)}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </DropdownContent>
      }
    />
  );
};
