import { type LayoutCard } from '@/ui/layout/tab-list/types/LayoutCard';
import { type IconComponent } from 'twenty-ui/display';

export type SingleTabProps<T extends string = string> = {
  title: string;
  Icon?: IconComponent;
  id: T;
  hide?: boolean;
  disabled?: boolean;
  pill?: string | React.ReactElement;
  cards?: LayoutCard[];
  logo?: string;
};
