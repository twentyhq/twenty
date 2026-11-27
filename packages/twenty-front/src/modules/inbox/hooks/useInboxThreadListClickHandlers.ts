import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const useInboxThreadListClickHandlers = ({
  threads,
  selectedThreadId,
  selectThread,
}: {
  threads: AiChatThreadRecord[];
  selectedThreadId: string | undefined;
  selectThread: (threadId: string | null) => void;
}) => {
  const isMobile = useIsMobile();
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const { toggleRecordSelection } = useToggleRecordSelection();
  const { resetRecordSelection } = useResetRecordSelection();

  const handleThreadClick = (
    { id }: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (isMobile && selectedRecordIds.length > 0) {
      toggleRecordSelection({ recordId: id });
      return;
    }

    if (isMobile || (!event.metaKey && !event.ctrlKey && !event.shiftKey)) {
      resetRecordSelection();
      selectThread(id);
      return;
    }

    if (
      selectedRecordIds.length === 0 &&
      isDefined(selectedThreadId) &&
      selectedThreadId !== id &&
      threads.some((thread) => thread.id === selectedThreadId)
    ) {
      toggleRecordSelection({ recordId: selectedThreadId });
    }

    toggleRecordSelection({ recordId: id, shouldSelectRange: event.shiftKey });
  };

  const handleThreadCheckboxClick = (
    { id }: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) =>
    toggleRecordSelection({ recordId: id, shouldSelectRange: event.shiftKey });

  return { handleThreadClick, handleThreadCheckboxClick };
};
