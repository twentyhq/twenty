import { atom } from 'recoil';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export const iconsState = atom<Record<string, IconComponent>>({
  key: 'iconsState',
  default: {},
});
