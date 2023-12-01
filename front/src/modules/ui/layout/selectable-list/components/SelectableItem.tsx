import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { useSelectableListScopedStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedStates';

type SelectableItemProps = {
  itemId: string;
  children: React.ReactElement;
};

export const SelectableItem = ({ itemId, children }: SelectableItemProps) => {
  const { isSelectedItemIdSelector } = useSelectableListScopedStates({
    itemId: itemId,
  });

  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelectedItemId) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelectedItemId]);

  return <div ref={scrollRef}>{children}</div>;
};
