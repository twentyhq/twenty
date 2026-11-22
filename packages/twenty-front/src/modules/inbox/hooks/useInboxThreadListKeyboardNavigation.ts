import { type RefObject, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

import { useRecordSelectionArrowKeyNavigation } from '@/object-record/record-selection/hooks/useRecordSelectionArrowKeyNavigation';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

export const useInboxThreadListKeyboardNavigation = ({
  threadListContainerRef,
  selectedThreadId,
  isListShown,
  selectThread,
  onEndReached,
}: {
  threadListContainerRef: RefObject<HTMLElement | null>;
  selectedThreadId: string | undefined;
  isListShown: boolean;
  selectThread: (threadId: string | null) => void;
  onEndReached: () => void;
}) => {
  const [keyboardCursorThreadId, setKeyboardCursorThreadId] =
    useState(selectedThreadId);

  if (
    isDefined(selectedThreadId) &&
    selectedThreadId !== keyboardCursorThreadId
  ) {
    setKeyboardCursorThreadId(selectedThreadId);
  }

  const { navigateWithArrowKey } = useRecordSelectionArrowKeyNavigation({
    selectableItemsContainerRef: threadListContainerRef,
    activeRecordId: keyboardCursorThreadId,
    onActiveRecordChange: selectThread,
    onEndReached,
  });

  useGlobalHotkeys({
    keys: [
      Key.ArrowUp,
      Key.ArrowDown,
      ...(isListShown
        ? [`${Key.Shift}+${Key.ArrowUp}`, `${Key.Shift}+${Key.ArrowDown}`]
        : []),
    ],
    callback: navigateWithArrowKey,
    containsModifier: false,
    dependencies: [navigateWithArrowKey],
    options: { enableOnContentEditable: false, enableOnFormTags: false },
  });
};
