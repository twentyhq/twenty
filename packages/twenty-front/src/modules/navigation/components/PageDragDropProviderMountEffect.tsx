import { useEffect } from 'react';

import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type PageDragDropProviderMountEffectProps = {
  onEnterEditMode: () => void;
};

export const PageDragDropProviderMountEffect = ({
  onEnterEditMode,
}: PageDragDropProviderMountEffectProps) => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  useEffect(() => {
    if (isLayoutCustomizationActive) {
      onEnterEditMode();
    }
  }, [isLayoutCustomizationActive, onEnterEditMode]);

  return null;
};
