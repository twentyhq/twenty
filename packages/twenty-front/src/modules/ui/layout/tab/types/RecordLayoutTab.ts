import { LayoutCard } from '@/ui/layout/tab/types/LayoutCard';
import { TabVisibilityConfig } from '@/ui/layout/tab/types/TabVisibilityConfig';
import { IconComponent } from 'twenty-ui';

export type RecordLayoutTab = {
  title: string;
  position: number;
  Icon: IconComponent;
  hide: TabVisibilityConfig;
  cards: LayoutCard[];
};
