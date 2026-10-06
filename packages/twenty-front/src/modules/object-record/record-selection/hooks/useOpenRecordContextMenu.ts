import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type CommandMenuDropdownTriggerEvent,
  useOpenCommandMenuDropdownAtCursor,
} from '@/command-menu-item/hooks/useOpenCommandMenuDropdownAtCursor';
import { recordIndexCommandMenuDropdownTargetCellComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownTargetCellComponentState';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

export const useOpenRecordContextMenu = () => {
  const store = useStore();

  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
  );

  const targetCellState = useAtomComponentStateCallbackState(
    recordIndexCommandMenuDropdownTargetCellComponentState,
  );

  const { openCommandMenuDropdownAtCursor } =
    useOpenCommandMenuDropdownAtCursor();

  const openRecordContextMenu = useCallback(
    ({
      event,
      recordId,
      fieldDefinition,
    }: {
      event: CommandMenuDropdownTriggerEvent;
      recordId: string;
      fieldDefinition?: FieldDefinition<FieldMetadata>;
    }) => {
      // Opening the menu can close the side panel, which resets the selection
      // in layout customization mode
      if (!openCommandMenuDropdownAtCursor(event)) {
        return;
      }

      store.set(isRecordSelectedFamilyState(recordId), true);
      store.set(
        targetCellState,
        isDefined(fieldDefinition) ? { recordId, fieldDefinition } : null,
      );
    },
    [
      isRecordSelectedFamilyState,
      openCommandMenuDropdownAtCursor,
      store,
      targetCellState,
    ],
  );

  return { openRecordContextMenu };
};
