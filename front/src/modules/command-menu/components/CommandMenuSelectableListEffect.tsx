import { useEffect } from 'react';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

type CommandMenuSelectableListEffectProps = {
  selectableItemIds: string[];
};

export const CommandMenuSelectableListEffect = ({
  selectableItemIds,
}: CommandMenuSelectableListEffectProps) => {
  const { setSelectableItemIds } = useSelectableList({
    selectableListId: 'command-menu-list',
  });

  useEffect(() => {
    setSelectableItemIds(selectableItemIds);
  }, [selectableItemIds, setSelectableItemIds]);

  return <></>;
};
