import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { Key } from 'ts-key-enum';

export const useSelectableListListenToEnterHotkeyOnItem = ({
  focusId,
  itemId,
  onEnter,
}: {
  focusId: string;
  itemId: string;
  onEnter: () => void;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  const store = useStore();

  const handleEnterKey = useCallback(() => {
    const selectedItemId = store.get(
      selectedItemIdComponentState.atomFamily({
        instanceId,
      }),
    );

    if (isNonEmptyString(selectedItemId) && selectedItemId === itemId) {
      onEnter?.();
    }
  }, [store, instanceId, itemId, onEnter]);

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: handleEnterKey,
    focusId,
    dependencies: [itemId, onEnter],
  });
};
