import { ReactNode, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

export type SelectableItemProps = {
  itemId: string;
  children: ReactNode;
  className?: string;
};

export const SelectableItem = ({
  itemId,
  children,
  className,
}: SelectableItemProps) => {
  const { isSelectedItemIdSelector } = useSelectableList();

  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector(itemId));

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelectedItemId) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelectedItemId]);

  return (
    <div className={className} ref={scrollRef}>
      {children}
    </div>
  );
};
