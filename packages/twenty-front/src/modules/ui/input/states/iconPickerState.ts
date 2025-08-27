import { createState } from 'twenty-ui/utilities';
import { IconApps, type IconComponent } from 'twenty-ui/display';

type IconPickerState = {
  Icon: IconComponent;
  iconKey: string;
};

export const iconPickerState = createState<IconPickerState>({
  key: 'iconPickerState',
  defaultValue: { Icon: IconApps, iconKey: 'IconApps' },
});
