import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadStatusField } from '@/ai/components/AiChatThreadStatusField';
import { useAiChatThreadDetailsStatus } from '@/ai/hooks/useAiChatThreadDetailsStatus';
import { type AiChatThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type AiChatThreadDetailsStatusProps = {
  threadId: string;
  dropdownId: string;
};

export const AiChatThreadDetailsStatus = ({
  threadId,
  dropdownId,
}: AiChatThreadDetailsStatusProps) => {
  const { status, scope, canChangeStatus, isPending, changeStatus } =
    useAiChatThreadDetailsStatus(threadId);
  const { closeDropdown } = useCloseDropdown();

  const handleStatusChange = ({
    status: nextStatus,
  }: {
    status: AiChatThreadTriageStatus;
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
    <AiChatThreadStatusField
      status={status}
      scope={scope}
      isSaving={isPending}
      onStatusChange={canChangeStatus ? handleStatusChange : undefined}
    />
  );
};
