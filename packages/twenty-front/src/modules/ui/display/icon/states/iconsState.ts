import { createState } from 'twenty-ui';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export const iconsState = createState<Record<string, IconComponent>>({
  key: 'iconsState',
  defaultValue: {},
});
