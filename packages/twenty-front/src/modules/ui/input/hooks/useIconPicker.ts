import { iconPickerState } from '@/ui/input/states/iconPickerState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';

export const useIconPicker = () => {
  const [iconPicker, setIconPicker] = useRecoilStateV2(iconPickerState);

  return {
    Icon: iconPicker.Icon,
    iconKey: iconPicker.iconKey,
    setIconPicker,
  };
};
