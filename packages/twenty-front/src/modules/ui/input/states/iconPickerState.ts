import { IconApps } from 'twenty-ui';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { createState } from '@/ui/utilities/state/utils/createState';

type IconPickerState = {
  Icon: IconComponent;
  iconKey: string;
};

export const iconPickerState = createState<IconPickerState>({
  key: 'iconPickerState',
  defaultValue: { Icon: IconApps, iconKey: 'IconApps' },
});
