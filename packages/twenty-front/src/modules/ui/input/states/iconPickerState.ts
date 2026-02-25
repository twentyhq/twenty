import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { IconApps, type IconComponent } from 'twenty-ui/display';

type IconPickerState = {
  Icon: IconComponent;
  iconKey: string;
};

export const iconPickerState = createAtomState<IconPickerState>({
  key: 'iconPickerState',
  defaultValue: { Icon: IconApps, iconKey: 'IconApps' },
});
