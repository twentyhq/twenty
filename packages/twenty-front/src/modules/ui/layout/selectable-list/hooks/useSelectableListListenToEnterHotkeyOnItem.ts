import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

export const useSelectableListListenToEnterHotkeyOnItem = ({
  focusId,
  itemId,
  onEnter,
  hotkeyScope,
}: {
  focusId: string;
  itemId: string;
  onEnter: () => void;
  // TODO: Remove this after migration to focus stack
  hotkeyScope: string;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: useRecoilCallback(
      ({ snapshot }) =>
        () => {
          const selectedItemId = getSnapshotValue(
            snapshot,
            selectedItemIdComponentState.atomFamily({
              instanceId,
            }),
          );

          if (isNonEmptyString(selectedItemId) && selectedItemId === itemId) {
            onEnter?.();
          }
        },
      [instanceId, itemId, onEnter],
    ),
    focusId,
    scope: hotkeyScope,
    dependencies: [itemId, onEnter],
  });
};
