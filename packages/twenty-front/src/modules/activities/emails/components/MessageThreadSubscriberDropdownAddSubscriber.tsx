import { MessageThreadSubscriberDropdownAddSubscriberMenuItem } from '@/activities/emails/components/MessageThreadSubscriberDropdownAddSubscriberMenuItem';
import { type MessageThreadSubscriber } from '@/activities/emails/types/MessageThreadSubscriber';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const MessageThreadSubscriberDropdownAddSubscriber = ({
  existingSubscribers,
}: {
  existingSubscribers: MessageThreadSubscriber[];
}) => {
  const { records: workspaceMembersLeftToAdd } =
    useFindManyRecords<WorkspaceMember>({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      filter: {
        not: {
          id: {
            in: existingSubscribers.map(
              ({ workspaceMember }) => workspaceMember.id,
            ),
          },
        },
      },
    });

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuSearchInput />
      <DropdownMenuSeparator />
      {workspaceMembersLeftToAdd.map((workspaceMember) => (
        <MessageThreadSubscriberDropdownAddSubscriberMenuItem
          workspaceMember={workspaceMember}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
