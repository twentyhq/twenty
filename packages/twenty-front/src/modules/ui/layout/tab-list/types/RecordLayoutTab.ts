import { type LayoutCard } from '@/ui/layout/tab-list/types/LayoutCard';
import { type TabVisibilityConfig } from '@/ui/layout/tab-list/types/TabVisibilityConfig';

export type RecordLayoutTab = {
  title: string;
  position: number;
  icon: string;
  hide: TabVisibilityConfig;
  cards: LayoutCard[];
};
