import { useContext } from 'react';

import { TabListItem } from '@/ui/layout/tab-list/components/TabListItem';
import { type TabListItemProps } from '@/ui/layout/tab-list/types/TabListItemProps';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';

type PageLayoutTabListDragHandleProps = Pick<
  TabListItemProps,
  'tab' | 'active' | 'disabled' | 'onSelect'
> & {
  isHighlighted: boolean;
};

export const PageLayoutTabListDragHandle = ({
  tab,
  active,
  disabled,
  isHighlighted,
  onSelect,
}: PageLayoutTabListDragHandleProps) => {
  const handleRef = useContext(DragDropItemSortableHandleRefContext);

  return (
    <TabListItem
      mode="tab"
      tab={tab}
      active={active}
      disabled={disabled}
      highlighted={isHighlighted}
      onSelect={onSelect}
      ref={handleRef}
      data-dnd-sortable-handle
    />
  );
};
