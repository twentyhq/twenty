import { LayoutCard } from '@/ui/layout/tab-list/types/LayoutCard';
import { TabVisibilityConfig } from '@/ui/layout/tab-list/types/TabVisibilityConfig';
import { IconComponent } from 'twenty-ui/display';

export type RecordLayoutTab = {
  title: string;
  position: number;
  Icon: IconComponent;
  hide: TabVisibilityConfig;
  cards: LayoutCard[];
  targetObjectNameSingular?: string;
};
