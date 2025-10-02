import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabActions } from '@/ui/layout/tab-list/types/TabActions';
import { type OnDragEndResponder } from '@hello-pangea/dnd';

export type TabListProps = {
  tabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks?: boolean;
  className?: string;
  isInRightDrawer?: boolean;
  componentInstanceId: string;
  onChangeTab?: (tabId: string) => void;
  onAddTab?: () => void;
  isDraggable?: boolean;
  onDragEnd?: OnDragEndResponder;
  tabActions?: TabActions;
};
