import { useStore } from 'jotai';
import { useCallback } from 'react';

import {
  type CommandMenuDropdownTriggerEvent,
  useOpenCommandMenuDropdownAtCursor,
} from '@/command-menu-item/hooks/useOpenCommandMenuDropdownAtCursor';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

export const useOpenRecordContextMenu = () => {
  const store = useStore();

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
  );

  const { openCommandMenuDropdownAtCursor } =
    useOpenCommandMenuDropdownAtCursor();

  const openRecordContextMenu = useCallback(
    ({
      event,
      recordId,
    }: {
      event: CommandMenuDropdownTriggerEvent;
      recordId: string;
    }) => {
      // Opening the menu can close the side panel, which resets the selection
      // in layout customization mode
      if (!openCommandMenuDropdownAtCursor(event)) {
        return;
      }

      store.set(isRecordSelectedFamilyState(recordId), true);
    },
    [isRecordSelectedFamilyState, openCommandMenuDropdownAtCursor, store],
  );

  return { openRecordContextMenu };
};
