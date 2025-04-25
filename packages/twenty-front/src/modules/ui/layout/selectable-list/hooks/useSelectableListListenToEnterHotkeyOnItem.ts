import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

export const useSelectableListListenToEnterHotkeyOnItem = ({
  hotkeyScope,
  itemId,
  onEnter,
}: {
  hotkeyScope: string;
  itemId: string;
  onEnter: () => void;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );
  useScopedHotkeys(
    Key.Enter,
    useRecoilCallback(
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
    hotkeyScope,
    [itemId, onEnter],
  );
};
