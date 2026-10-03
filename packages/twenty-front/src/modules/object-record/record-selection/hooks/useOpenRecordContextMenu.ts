import { useStore } from 'jotai';
import { type MouseEvent, useCallback } from 'react';

import { useOpenCommandMenuDropdownAtCursor } from '@/command-menu-item/hooks/useOpenCommandMenuDropdownAtCursor';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

export const useOpenRecordContextMenu = () => {
  const store = useStore();

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
  );

  const { isCommandMenuAvailable, openCommandMenuDropdownAtCursor } =
    useOpenCommandMenuDropdownAtCursor();

  const openRecordContextMenu = useCallback(
    ({ event, recordId }: { event: MouseEvent; recordId: string }) => {
      if (!isCommandMenuAvailable) {
        return;
      }

      store.set(isRecordSelectedFamilyState(recordId), true);

      openCommandMenuDropdownAtCursor(event);
    },
    [
      isCommandMenuAvailable,
      isRecordSelectedFamilyState,
      openCommandMenuDropdownAtCursor,
      store,
    ],
  );

  return { openRecordContextMenu };
};
