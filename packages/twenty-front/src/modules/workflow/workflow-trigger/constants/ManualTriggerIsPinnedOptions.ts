import { IconPinned, IconPinnedOff } from '@tabler/icons-react';
import { IconComponent } from 'twenty-ui/display';

export const MANUAL_TRIGGER_IS_PINNED_OPTIONS: Array<{
  label: string;
  value: boolean;
  Icon: IconComponent;
}> = [
  {
    label: 'Not Pinned',
    value: false,
    Icon: IconPinnedOff,
  },
  {
    label: 'Pinned',
    value: true,
    Icon: IconPinned,
  },
];
