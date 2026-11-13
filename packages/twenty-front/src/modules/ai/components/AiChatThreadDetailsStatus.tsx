import { isDefined } from 'twenty-shared/utils';

import { InboxThreadStatusField } from '@/ai/components/AiChatThreadStatusField';
import { useInboxThreadDetailsStatus } from '@/ai/hooks/useAiChatThreadDetailsStatus';
import { type InboxThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type InboxThreadDetailsStatusProps = {
  threadId: string;
  dropdownId: string;
};

export const InboxThreadDetailsStatus = ({
  threadId,
  dropdownId,
}: InboxThreadDetailsStatusProps) => {
  const { status, scope, canChangeStatus, isPending, changeStatus } =
    useInboxThreadDetailsStatus(threadId);
  const { closeDropdown } = useCloseDropdown();

  const handleStatusChange = ({
    status: nextStatus,
  }: {
    status: InboxThreadTriageStatus;
  }) => {
    if (nextStatus === 'snoozed') {
      closeDropdown(dropdownId);
    }

    changeStatus(nextStatus);
  };

  if (!isDefined(status) || !isDefined(scope)) {
    return null;
  }

  return (
    <InboxThreadStatusField
      status={status}
      scope={scope}
      isSaving={isPending}
      onStatusChange={canChangeStatus ? handleStatusChange : undefined}
    />
  );
};
