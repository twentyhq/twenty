import { useTheme } from '@emotion/react';
import { offset } from '@floating-ui/react';
import {
  Avatar,
  Chip,
  ChipVariant,
  IconChevronDown,
  IconPlus,
  IconUserCircle,
  MultiChip,
} from 'twenty-ui';

import { MessageThreadMember } from '@/activities/emails/types/MessageThreadMember';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemSelectAvatar';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const SharedDropdownMenu = ({
  messageThreadMembers,
  label = '',
  everyone = false,
}: {
  messageThreadMembers: MessageThreadMember[] | null;
  label?: string;
  everyone?: boolean;
}) => {
  const messageThreadMembersAvatarUrls = messageThreadMembers?.map(
    (member) => member.workspaceMember.avatarUrl,
  );

  const messageThreadMembersNames = messageThreadMembers?.map(
    (member) => member.workspaceMember?.name.firstName,
  );

  const theme = useTheme();

  const { closeDropdown } = useDropdown('message-thread-share');

  const handleAddParticipantClick = () => {
    closeDropdown();
  };

  const handleParticipantClick = () => {
    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={'message-thread-share'}
      clickableComponent={
        everyone ? (
          <Chip
            label="Everyone"
            variant={ChipVariant.Highlighted}
            leftComponent={<IconUserCircle size={theme.icon.size.md} />}
            rightComponent={<IconChevronDown size={theme.icon.size.sm} />}
          />
        ) : messageThreadMembers?.length === 1 ? (
          <Chip
            label={label}
            variant={ChipVariant.Highlighted}
            leftComponent={
              <Avatar
                avatarUrl={getImageAbsoluteURIOrBase64(
                  messageThreadMembersAvatarUrls?.[0],
                )}
                entityId={messageThreadMembers?.[0].workspaceMember.id}
                placeholder={messageThreadMembersNames?.[0]}
                size="md"
                type={'rounded'}
              />
            }
            rightComponent={<IconChevronDown size={theme.icon.size.sm} />}
          />
        ) : (
          <MultiChip
            names={messageThreadMembersNames ?? []}
            RightIcon={IconChevronDown}
            avatarUrls={
              (messageThreadMembersAvatarUrls?.filter(Boolean) as string[]) ??
              []
            }
          />
        )
      }
      dropdownComponents={
        <DropdownMenu width="160px" z-index={offset(1)}>
          <DropdownMenuItemsContainer>
            <DropdownMenuSeparator />
            {messageThreadMembers?.map((member) => (
              <MenuItemSelectAvatar
                key={member.workspaceMember.id}
                selected={false}
                testId="menu-item"
                onClick={handleParticipantClick}
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
            <DropdownMenuSeparator />
            <MenuItem
              LeftIcon={IconPlus}
              onClick={handleAddParticipantClick}
              text="Add participant"
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: 'message-thread-share',
      }}
    />
  );
};
