import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const CommandMenuDefaultSelectionEffect = ({
  selectableItemIds,
}: {
  selectableItemIds: string[];
}) => {
  const { setSelectedItemId, selectedItemIdState } =
    useSelectableList('command-menu-list');

  const selectedItemId = useRecoilValue(selectedItemIdState);

  const hasUserSelectedCommand = useRecoilValue(hasUserSelectedCommandState);

  useEffect(() => {
    if (
      isDefined(selectedItemId) &&
      selectableItemIds.includes(selectedItemId) &&
      hasUserSelectedCommand
    ) {
      return;
    }

    if (selectableItemIds.length > 0) {
      setSelectedItemId(selectableItemIds[0]);
    }
  }, [
    hasUserSelectedCommand,
    selectableItemIds,
    selectedItemId,
    setSelectedItemId,
  ]);

  return null;
};
