import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuDefaultSelectionEffect = ({
  selectableItemIds,
}: {
  selectableItemIds: string[];
}) => {
  const { setSelectedItemId } = useSelectableList('command-menu-list');

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    'command-menu-list',
  );

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
