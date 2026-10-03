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

      // Opening the menu can close the side panel, which resets the selection
      // in layout customization mode
      openCommandMenuDropdownAtCursor(event);

      store.set(isRecordSelectedFamilyState(recordId), true);
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
