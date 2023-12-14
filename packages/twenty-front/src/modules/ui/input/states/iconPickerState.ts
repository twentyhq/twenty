import { atom } from 'recoil';

import { IconApps } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

type IconPickerState = {
  Icon: IconComponent;
  iconKey: string;
};

export const iconPickerState = atom<IconPickerState>({
  key: 'iconPickerState',
  default: { Icon: IconApps, iconKey: 'IconApps' },
});
