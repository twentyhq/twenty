import { useIsGlobalLayoutCustomizationActive } from '@/app/hooks/useIsGlobalLayoutCustomizationActive';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { type ReactNode } from 'react';

type RecordPageLayoutEditModeProviderProps = {
  children: ReactNode;
};

export const RecordPageLayoutEditModeProvider = ({
  children,
}: RecordPageLayoutEditModeProviderProps) => {
  const isInEditMode = useIsGlobalLayoutCustomizationActive();

  return (
    <PageLayoutEditModeProviderContext value={{ isInEditMode }}>
      {children}
    </PageLayoutEditModeProviderContext>
  );
};
