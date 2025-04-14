import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

export const useListenToEnterHotkeyOnListItem = ({
  hotkeyScope,

  itemId,
  onEnter,
}: {
  hotkeyScope: string;

  itemId: string;
  onEnter: () => void;
}) => {
  useScopedHotkeys(
    Key.Enter,
    useRecoilCallback(
      ({ snapshot }) =>
        () => {
          const selectedItemId = getSnapshotValue(
            snapshot,
            selectedItemIdComponentState.atomFamily({
              instanceId: itemId,
            }),
          );

          if (isNonEmptyString(selectedItemId) && selectedItemId === itemId) {
            onEnter?.();
          }
        },
      [itemId, onEnter],
    ),
    hotkeyScope,
    [itemId, onEnter],
    {
      preventDefault: false,
    },
  );
};
