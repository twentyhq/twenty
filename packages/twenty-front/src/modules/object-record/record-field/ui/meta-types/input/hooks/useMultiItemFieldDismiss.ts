import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { currentFocusedItemSelector } from '@/ui/utilities/focus/states/currentFocusedItemSelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useStore } from 'jotai';
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

  const store = useStore();

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      // Read at click time: closing a nested item menu on the same click changes focus after the last render.
      const currentFocusedItem = store.get(currentFocusedItemSelector.atom);

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
