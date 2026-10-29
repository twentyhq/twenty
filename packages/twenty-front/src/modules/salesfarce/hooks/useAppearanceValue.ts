import { SALESFARCE_APPEARANCE_VALUE } from '@/salesfarce/constants/SalesfarceAppearanceValue';
import { isSalesfarceActiveState } from '@/salesfarce/states/isSalesfarceActiveState';
import { type AppearanceValue } from '@/salesfarce/types/AppearanceValue';
import { enterSalesfarce } from '@/salesfarce/utils/enterSalesfarce';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useColorScheme } from '@/workspace-member/hooks/useColorScheme';

export const useAppearanceValue = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isSalesfarceActive = useAtomStateValue(isSalesfarceActiveState);

  const setAppearanceValue = (value: AppearanceValue) => {
    if (value === SALESFARCE_APPEARANCE_VALUE) {
      enterSalesfarce();
      return;
    }

    void setColorScheme(value);
  };

  return {
    appearanceValue: isSalesfarceActive
      ? SALESFARCE_APPEARANCE_VALUE
      : colorScheme,
    setAppearanceValue,
  };
};
