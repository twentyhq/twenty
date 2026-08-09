import { useInboxItem } from '@/inbox/hooks/useInboxItem';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// The context bar lives in the side panel, which is mounted app wide, so it
// looks its item up by id rather than having one threaded down.
export const useSelectedInboxItem = () => {
  const selectedInboxItemId = useAtomStateValue(selectedInboxItemIdState);
  const { inboxItem } = useInboxItem(selectedInboxItemId ?? undefined);

  return { selectedInboxItem: inboxItem };
};
