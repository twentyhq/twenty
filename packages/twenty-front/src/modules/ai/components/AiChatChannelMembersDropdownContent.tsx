import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronLeft, IconLogout, IconX } from 'twenty-ui/icon';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/primitives/navigation';

import { AiChatChannelRolesSection } from '@/ai/components/AiChatChannelRolesSection';
import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { getWorkspaceMemberFullName } from '@/ai/utils/getWorkspaceMemberFullName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatChannelMemberRole } from '~/generated-metadata/graphql';

type AiChatChannelMembersDropdownContentProps = {
  channelId: string;
  onBack: () => void;
};

export const AiChatChannelMembersDropdownContent = ({
  channelId,
  onBack,
}: AiChatChannelMembersDropdownContentProps) => {
  const { t } = useLingui();
  const [searchFilter, setSearchFilter] = useState('');
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { getChannelMembers, isCurrentUserChannelAdmin } = useChatChannels();
  const { addChatChannelMember, removeChatChannelMember, leaveChatChannel } =
    useChatChannelActions();

  const channelMembers = getChannelMembers(channelId);
  const isAdmin = isCurrentUserChannelAdmin(channelId);
  const currentUserWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const membersWithWorkspaceMember = channelMembers.flatMap((member) => {
    const workspaceMember = currentWorkspaceMembers.find(
      (candidate) => candidate.userWorkspaceId === member.userWorkspaceId,
    );

    return isDefined(workspaceMember) ? [{ member, workspaceMember }] : [];
  });

  const memberUserWorkspaceIds = new Set(
    channelMembers.map((member) => member.userWorkspaceId),
  );
  const normalizedSearchFilter = searchFilter.trim().toLowerCase();

  const invitableWorkspaceMembers = currentWorkspaceMembers.filter(
    (workspaceMember) =>
      isDefined(workspaceMember.userWorkspaceId) &&
      !memberUserWorkspaceIds.has(workspaceMember.userWorkspaceId) &&
      (normalizedSearchFilter.length === 0 ||
        getWorkspaceMemberFullName(workspaceMember)
          .toLowerCase()
          .includes(normalizedSearchFilter) ||
        workspaceMember.userEmail
          .toLowerCase()
          .includes(normalizedSearchFilter)),
  );

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Members`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer hasMaxHeight>
        {membersWithWorkspaceMember.map(({ member, workspaceMember }) => {
          const fullName = getWorkspaceMemberFullName(workspaceMember);
          const isAdminRow = member.role === AgentChatChannelMemberRole.ADMIN;
          const isCurrentUserRow =
            member.userWorkspaceId === currentUserWorkspaceId;
          const canRemove = isCurrentUserRow || (isAdmin && !isAdminRow);

          return (
            <MenuItemAvatar
              key={member.id}
              avatar={{
                shape: 'circle',
                size: 'md',
                name: fullName,
                colorSeed: workspaceMember.id,
                src: workspaceMember.avatarUrl,
              }}
              text={fullName}
              contextualText={isAdminRow ? t`Admin` : undefined}
              iconButtons={
                canRemove ? (
                  <LightIconButton
                    aria-label={
                      isCurrentUserRow
                        ? t`Leave channel`
                        : t`Remove ${fullName}`
                    }
                    onClick={() =>
                      isCurrentUserRow && isDefined(currentUserWorkspaceId)
                        ? leaveChatChannel({
                            channelId,
                            userWorkspaceId: currentUserWorkspaceId,
                          })
                        : removeChatChannelMember({
                            channelId,
                            userWorkspaceId: member.userWorkspaceId,
                          })
                    }
                  >
                    {isCurrentUserRow ? <IconLogout /> : <IconX />}
                  </LightIconButton>
                ) : undefined
              }
            />
          );
        })}
      </DropdownMenuItemsContainer>
      <AiChatChannelRolesSection channelId={channelId} />
      {isAdmin && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuHeader>{t`Add people`}</DropdownMenuHeader>
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={handleSearchFilterChange}
            placeholder={t`Search`}
            autoFocus
          />
          <DropdownMenuItemsContainer hasMaxHeight>
            {invitableWorkspaceMembers.length === 0 ? (
              <MenuItem disabled text={t`No Results`} />
            ) : (
              invitableWorkspaceMembers.map((workspaceMember) => {
                const fullName = getWorkspaceMemberFullName(workspaceMember);

                return (
                  <MenuItemAvatar
                    key={workspaceMember.id}
                    onClick={() => {
                      if (isDefined(workspaceMember.userWorkspaceId)) {
                        void addChatChannelMember({
                          channelId,
                          userWorkspaceId: workspaceMember.userWorkspaceId,
                        });
                      }
                    }}
                    avatar={{
                      shape: 'circle',
                      size: 'md',
                      name: fullName,
                      colorSeed: workspaceMember.id,
                      src: workspaceMember.avatarUrl,
                    }}
                    text={fullName}
                    contextualText={workspaceMember.userEmail}
                  />
                );
              })
            )}
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};
