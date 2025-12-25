import { useRecoilState } from 'recoil';

import { iconPickerState } from '@/ui/input/states/iconPickerState';

export const useIconPicker = () => {
  const [iconPicker, setIconPicker] = useRecoilState(iconPickerState);

  return {
    Icon: iconPicker.Icon,
    iconKey: iconPicker.iconKey,
    setIconPicker,
  };
};
