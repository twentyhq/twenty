import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsGlobalLayoutCustomizationActive = () => {
  const isGlobalLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  return isGlobalLayoutCustomizationActive;
};
