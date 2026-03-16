import { isLayoutCustomizationModeEnabledState } from '@/app/states/isLayoutCustomizationModeEnabledState';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ReactNode } from 'react';

type RecordPageLayoutEditModeProviderProps = {
  children: ReactNode;
};

export const RecordPageLayoutEditModeProvider = ({
  children,
}: RecordPageLayoutEditModeProviderProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <PageLayoutEditModeProviderContext
      value={{ isInEditMode: isLayoutCustomizationModeEnabled }}
    >
      {children}
    </PageLayoutEditModeProviderContext>
  );
};
