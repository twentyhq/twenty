import { offset } from '@floating-ui/react';
import { IconMinus, IconPlus, MenuItem, MenuItemAvatar } from 'twenty-ui';

import { MessageThreadSubscriberDropdownAddSubscriber } from '@/activities/emails/components/MessageThreadSubscriberDropdownAddSubscriber';
import { MessageThreadSubscribersChip } from '@/activities/emails/components/MessageThreadSubscribersChip';
import { MessageThreadSubscriber } from '@/activities/emails/types/MessageThreadSubscriber';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';
import { useState } from 'react';

export const MESSAGE_THREAD_SUBSCRIBER_DROPDOWN_ID =
  'message-thread-subscriber';

export const MessageThreadSubscribersDropdownButton = ({
  messageThreadSubscribers,
}: {
  messageThreadSubscribers: MessageThreadSubscriber[];
}) => {
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false);

  const { closeDropdown } = useDropdown(MESSAGE_THREAD_SUBSCRIBER_DROPDOWN_ID);

  const mockSubscribers = [
    ...messageThreadSubscribers,
    ...messageThreadSubscribers,
    ...messageThreadSubscribers,
    ...messageThreadSubscribers,
  ];

  // TODO: implement
  const handleAddSubscriberClick = () => {
    setIsAddingSubscriber(true);
  };

  // TODO: implement
  const handleRemoveSubscriber = (_subscriber: MessageThreadSubscriber) => {
    closeDropdown();
  };

  useListenRightDrawerClose(() => {
    closeDropdown();
  });

  return (
    <Dropdown
      dropdownId={MESSAGE_THREAD_SUBSCRIBER_DROPDOWN_ID}
      clickableComponent={
        <MessageThreadSubscribersChip
          messageThreadSubscribers={mockSubscribers}
        />
      }
      dropdownComponents={
        <DropdownMenu width="160px" z-index={offset(1)}>
          {isAddingSubscriber ? (
            <MessageThreadSubscriberDropdownAddSubscriber
              existingSubscribers={messageThreadSubscribers}
            />
          ) : (
            <DropdownMenuItemsContainer>
              {messageThreadSubscribers?.map((subscriber) => (
                <MenuItemAvatar
                  key={subscriber.workspaceMember.id}
                  testId="menu-item"
                  onClick={() => {
                    handleRemoveSubscriber(subscriber);
                  }}
                  text={
                    subscriber.workspaceMember.name.firstName +
                    ' ' +
                    subscriber.workspaceMember.name.lastName
                  }
                  avatar={{
                    placeholder: subscriber.workspaceMember.name.firstName,
                    avatarUrl: subscriber.workspaceMember.avatarUrl,
                    placeholderColorSeed: subscriber.workspaceMember.id,
                    size: 'md',
                    type: 'rounded',
                  }}
                  iconButtons={[
                    {
                      Icon: IconMinus,
                      onClick: () => {
                        handleRemoveSubscriber(subscriber);
                      },
                    },
                  ]}
                />
              ))}
              <DropdownMenuSeparator />
              <MenuItem
                LeftIcon={IconPlus}
                onClick={handleAddSubscriberClick}
                text="Add subscriber"
              />
            </DropdownMenuItemsContainer>
          )}
        </DropdownMenu>
      }
      dropdownHotkeyScope={{ scope: MESSAGE_THREAD_SUBSCRIBER_DROPDOWN_ID }}
    />
  );
};
