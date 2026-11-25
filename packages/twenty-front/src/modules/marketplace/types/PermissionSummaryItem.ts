import { type IconComponent } from 'twenty-ui/icon';

export type PermissionSummaryItem = {
  Icon: IconComponent;
  label: string;
  emphasis?: string;
  details?: {
    title: string;
    items: string[];
  };
};
