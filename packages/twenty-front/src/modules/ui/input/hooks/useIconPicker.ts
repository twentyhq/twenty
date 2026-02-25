import { iconPickerState } from '@/ui/input/states/iconPickerState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useIconPicker = () => {
  const [iconPicker, setIconPicker] = useAtomState(iconPickerState);

  return {
    Icon: iconPicker.Icon,
    iconKey: iconPicker.iconKey,
    setIconPicker,
  };
};
