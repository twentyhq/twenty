import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { useSelectableListScopedStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedStates';

type SelectableItemProps = {
  itemId: string;
  children: React.ReactElement;
};

export const SelectableItem = ({ itemId, children }: SelectableItemProps) => {
  const { selectableItemIdsSelectedMapState } = useSelectableListScopedStates({
    itemId: itemId,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const selectableItemIdsSelectedMap = useRecoilValue(
    selectableItemIdsSelectedMapState,
  );

  useEffect(() => {
    if (!selectableItemIdsSelectedMap) {
      return;
    }
    scrollRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectableItemIdsSelectedMap]);

  return (
    <div ref={scrollRef}>
      {React.cloneElement(children, {
        isSelected: selectableItemIdsSelectedMap,
      })}
    </div>
  );
};
