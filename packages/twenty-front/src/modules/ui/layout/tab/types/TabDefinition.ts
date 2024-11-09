import { TabCard } from '@/ui/layout/tab/types/TabCard';
import { TabVisibilityConfig } from '@/ui/layout/tab/types/TabVisibilityConfig';
import { IconComponent } from 'twenty-ui';

export type TabDefinition = {
  id: string;
  title: string;
  Icon: IconComponent;
  hide: TabVisibilityConfig;
  cards: TabCard[];
};
