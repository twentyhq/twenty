import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { IconApps, type IconComponent } from 'twenty-ui/display';

type IconPickerState = {
  Icon: IconComponent;
  iconKey: string;
};

export const iconPickerState = createStateV2<IconPickerState>({
  key: 'iconPickerState',
  defaultValue: { Icon: IconApps, iconKey: 'IconApps' },
});
