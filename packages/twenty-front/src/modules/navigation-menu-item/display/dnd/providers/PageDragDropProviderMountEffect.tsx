import { useEffect } from 'react';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type PageDragDropProviderMountEffectProps = {
  onEnterEditMode: () => void;
};

export const PageDragDropProviderMountEffect = ({
  onEnterEditMode,
}: PageDragDropProviderMountEffectProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  useEffect(() => {
    if (isLayoutCustomizationModeEnabled) {
      onEnterEditMode();
    }
  }, [isLayoutCustomizationModeEnabled, onEnterEditMode]);

  return null;
};
