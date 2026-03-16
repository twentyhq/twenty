import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsGlobalLayoutCustomizationActive = () => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  // TODO: remove this
  const isGlobalLayoutCustomizationActive = isLayoutCustomizationActive;

  return isGlobalLayoutCustomizationActive;
};
