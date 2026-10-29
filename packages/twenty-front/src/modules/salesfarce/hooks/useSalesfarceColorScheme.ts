import { SALESFARCE_APPEARANCE_VALUE } from '@/salesfarce/constants/SalesfarceAppearanceValue';
import { salesfarceIsActiveState } from '@/salesfarce/states/salesfarceIsActiveState';
import { salesfarceEnter } from '@/salesfarce/utils/salesfarceEnter';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useColorScheme } from '@/workspace-member/hooks/useColorScheme';

export const useSalesfarceColorScheme = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const salesfarceIsActive = useAtomStateValue(salesfarceIsActiveState);

  const setSalesfarceColorScheme = async (
    value: ColorScheme | typeof SALESFARCE_APPEARANCE_VALUE,
  ) => {
    if (value === SALESFARCE_APPEARANCE_VALUE) {
      salesfarceEnter();
      return;
    }

    await setColorScheme(value);
  };

  return {
    colorScheme: salesfarceIsActive ? SALESFARCE_APPEARANCE_VALUE : colorScheme,
    setColorScheme: setSalesfarceColorScheme,
  };
};
