import { atom } from 'recoil';

import { IconComponent } from '@/ui/icon/types/IconComponent';

import { IconApps } from '../constants/icons';

type IconPickerState = {
  Icon: IconComponent;
  iconKey: string;
};

export const iconPickerState = atom<IconPickerState>({
  key: 'iconPickerState',
  default: { Icon: IconApps, iconKey: 'IconApps' },
});
