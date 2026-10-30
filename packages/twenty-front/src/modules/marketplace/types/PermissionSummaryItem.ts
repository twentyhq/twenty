import { type IconComponent } from 'twenty-ui/icon';

export type PermissionSummaryItem = {
  Icon: IconComponent;
  label: string;
  details?: {
    title: string;
    items: string[];
  };
};
