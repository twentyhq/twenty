import { useTheme } from '@emotion/react';
import { offset } from '@floating-ui/react';
import {
  Avatar,
  Chip,
  ChipVariant,
  IconChevronDown,
  IconPlus,
  MultiChip,
} from 'twenty-ui';

import { MessageThreadSubscriber } from '@/activities/emails/types/MessageThreadSubscriber';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemSelectAvatar';
import { isNonEmptyString } from '@sniptt/guards';

export const MessageThreadSubscribersDropdownButton = ({
  messageThreadSubscribers,
  label,
}: {
  messageThreadSubscribers: MessageThreadSubscriber[];
  label: string;
}) => {
  const messageThreadMembersAvatarUrls = messageThreadSubscribers
    .map((member) => member.workspaceMember.avatarUrl)
    .filter(isNonEmptyString);

  const firstAvatarUrl = messageThreadMembersAvatarUrls[0];

  const messageThreadMembersNames = messageThreadSubscribers.map(
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
        messageThreadSubscribers?.length === 1 ? (
          <Chip
            label={label ?? ''}
            variant={ChipVariant.Highlighted}
            leftComponent={
              <Avatar
                avatarUrl={firstAvatarUrl}
                placeholderColorSeed={
                  messageThreadSubscribers?.[0].workspaceMember.id
                }
                placeholder={messageThreadMembersNames?.[0]}
                size="md"
                type={'rounded'}
              />
            }
            rightComponent={<IconChevronDown size={theme.icon.size.sm} />}
          />
        ) : (
          <MultiChip
            names={messageThreadMembersNames}
            RightIcon={IconChevronDown}
            avatarUrls={messageThreadMembersAvatarUrls}
          />
        )
      }
      dropdownComponents={
        <DropdownMenu width="160px" z-index={offset(1)}>
          <DropdownMenuItemsContainer>
            {messageThreadSubscribers?.map((member) => (
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
                    avatarUrl={member.workspaceMember.avatarUrl}
                    placeholderColorSeed={member.workspaceMember.id}
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
