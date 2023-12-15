import { ReactNode, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { useSelectableListScopedStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedStates';

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

  return (
    <div className={className} ref={scrollRef}>
      {children}
    </div>
  );
};
