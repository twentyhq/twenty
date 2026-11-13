import { InboxMessage } from '@/ai/components/InboxMessage';
import { inboxNonLastMessageIdsSelector } from '@/ai/states/selectors/inboxNonLastMessageIdsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const InboxNonLastMessageIdsList = () => {
  const inboxNonLastMessageIds = useAtomStateValue(
    inboxNonLastMessageIdsSelector,
  );

  return inboxNonLastMessageIds.map((messageId) => (
    <InboxMessage key={messageId} messageId={messageId} />
  ));
};
