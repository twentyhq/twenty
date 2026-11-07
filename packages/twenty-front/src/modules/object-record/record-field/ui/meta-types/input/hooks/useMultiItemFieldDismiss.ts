import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { currentFocusedItemSelector } from '@/ui/utilities/focus/states/currentFocusedItemSelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type RefObject } from 'react';
import { Key } from 'ts-key-enum';

export const useMultiItemFieldDismiss = ({
  containerRef,
  onClickOutside,
  onEscape,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  onClickOutside: (event: MouseEvent | TouchEvent) => void;
  onEscape: () => void;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const currentFocusedItem = useAtomStateValue(currentFocusedItemSelector);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      if (
        currentFocusedItem?.componentInstance.componentType !==
        FocusComponentType.OPENED_FIELD_INPUT
      ) {
        return;
      }

      onClickOutside(event);
    },
    listenerId: instanceId,
  });

  useHotkeysOnFocusedElement({
    focusId: instanceId,
    keys: [Key.Escape],
    callback: onEscape,
    dependencies: [onEscape],
  });
};
