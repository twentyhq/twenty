import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
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
  const { selectedItemIdState } = useSelectableList();

  useScopedHotkeys(
    Key.Enter,
    useRecoilCallback(
      ({ snapshot }) =>
        () => {
          const selectedItemId = getSnapshotValue(
            snapshot,
            selectedItemIdState,
          );

          if (isNonEmptyString(selectedItemId) && selectedItemId === itemId) {
            onEnter?.();
          }
        },
      [itemId, onEnter, selectedItemIdState],
    ),
    hotkeyScope,
    [],
    {
      preventDefault: false,
    },
  );
};
