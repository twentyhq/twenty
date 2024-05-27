import { offset } from '@floating-ui/react';
import { Avatar, IconUser, MultiChip } from 'twenty-ui';

import { MessageThreadMember } from '@/activities/emails/types/MessageThreadMember';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemSelectAvatar';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const SharedDropdownMenu = ({
  messageThreadMembers,
}: {
  messageThreadMembers: MessageThreadMember[] | null;
}) => {
  const messageThreadMembersAvatarUrls = messageThreadMembers?.map(
    (member) => member.workspaceMember.avatarUrl,
  );

  const messageThreadMembersNames = messageThreadMembers?.map(
    (member) => member.workspaceMember?.name.firstName,
  );

  return (
    <Dropdown
      dropdownId={'message-thread-share'}
      clickableComponent={
        <MultiChip
          names={messageThreadMembersNames ?? []}
          avatarUrls={
            (messageThreadMembersAvatarUrls?.filter(Boolean) as string[]) ?? []
          }
        />
      }
      dropdownComponents={
        <DropdownMenu width="160px" z-index={offset(1)}>
          <DropdownMenuItemsContainer>
            <MenuItem text="Everyone" accent="default" LeftIcon={IconUser} />
            <DropdownMenuSeparator />
            {messageThreadMembers?.map((member) => (
              <MenuItemSelectAvatar
                key={member.workspaceMember.id}
                selected={false}
                testId="menu-item"
                text={
                  member.workspaceMember.name.firstName +
                  ' ' +
                  member.workspaceMember.name.lastName
                }
                avatar={
                  <Avatar
                    avatarUrl={getImageAbsoluteURIOrBase64(
                      member.workspaceMember.avatarUrl,
                    )}
                    entityId={member.workspaceMember.id}
                    placeholder={member.workspaceMember.name.firstName}
                    size="md"
                    type={'rounded'}
                  />
                }
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: 'message-thread-share',
      }}
    />
  );
};
