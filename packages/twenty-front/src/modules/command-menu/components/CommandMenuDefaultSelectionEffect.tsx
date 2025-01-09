import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const CommandMenuDefaultSelectionEffect = ({
  selectableItemIds,
}: {
  selectableItemIds: string[];
}) => {
  const { setSelectedItemId, selectedItemIdState } =
    useSelectableList('command-menu-list');

  const selectedItemId = useRecoilValue(selectedItemIdState);

  useEffect(() => {
    if (isDefined(selectedItemId)) {
      return;
    }

    if (selectableItemIds.length > 0) {
      setSelectedItemId(selectableItemIds[0]);
    }
  }, [selectableItemIds, selectedItemId, setSelectedItemId]);

  return null;
};
