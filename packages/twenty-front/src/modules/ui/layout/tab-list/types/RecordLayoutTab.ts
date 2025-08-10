import { type LayoutCard } from '@/ui/layout/tab-list/types/LayoutCard';
import { type TabVisibilityConfig } from '@/ui/layout/tab-list/types/TabVisibilityConfig';
import { type IconComponent } from 'twenty-ui/display';

export type RecordLayoutTab = {
  title: string;
  position: number;
  Icon: IconComponent;
  hide: TabVisibilityConfig;
  cards: LayoutCard[];
  targetObjectNameSingular?: string;
};
