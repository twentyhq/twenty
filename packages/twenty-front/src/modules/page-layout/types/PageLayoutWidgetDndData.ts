import { type PageLayoutTabDragData } from '@/page-layout/types/PageLayoutTabDragData';
import { type PageLayoutTabMoreButtonDropData } from '@/page-layout/types/PageLayoutTabMoreButtonDropData';
import { type PageLayoutTabWidgetDropData } from '@/page-layout/types/PageLayoutTabWidgetDropData';
import { type PageLayoutWidgetDragData } from '@/page-layout/types/PageLayoutWidgetDragData';
import { type PageLayoutWidgetListDropData } from '@/page-layout/types/PageLayoutWidgetListDropData';

export type PageLayoutWidgetDndData =
  | PageLayoutWidgetDragData
  | PageLayoutTabWidgetDropData
  | PageLayoutWidgetListDropData
  | PageLayoutTabDragData
  | PageLayoutTabMoreButtonDropData;
