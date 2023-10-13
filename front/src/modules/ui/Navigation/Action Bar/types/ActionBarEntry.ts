import { IconComponent } from '@/ui/Display/Icon/types/IconComponent';

import { ActionBarItemAccent } from './ActionBarItemAccent';

export type ActionBarEntry = {
  label: string;
  Icon: IconComponent;
  accent?: ActionBarItemAccent;
  onClick: () => void;
};
