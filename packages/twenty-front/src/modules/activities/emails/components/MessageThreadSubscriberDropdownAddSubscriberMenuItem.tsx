import { MessageThreadSubscriber } from '@/activities/emails/types/MessageThreadSubscriber';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { IconPlus, MenuItemAvatar } from 'twenty-ui';

export const MessageThreadSubscriberDropdownAddSubscriberMenuItem = ({
  workspaceMember,
}: {
  workspaceMember: WorkspaceMember;
}) => {
  const text = `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`;

  const { createOneRecord } = useCreateOneRecord<MessageThreadSubscriber>({
    objectNameSingular: CoreObjectNameSingular.MessageThreadSubscriber,
  });

  const handleAddButtonClick = () => {
    createOneRecord({
      workspaceMember,
    });
  };

  return (
    <MenuItemAvatar
      avatar={{
        placeholder: workspaceMember.name.firstName,
        avatarUrl: workspaceMember.avatarUrl,
        placeholderColorSeed: workspaceMember.id,
        size: 'md',
        type: 'rounded',
      }}
      text={text}
      iconButtons={[
        {
          Icon: IconPlus,
          onClick: handleAddButtonClick,
        },
      ]}
    />
  );
};
