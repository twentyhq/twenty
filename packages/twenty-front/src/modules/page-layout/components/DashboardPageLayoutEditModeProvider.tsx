import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { useIsDashboardPageLayoutInEditMode } from '@/page-layout/hooks/useIsDashboardPageLayoutInEditMode';
import { type ReactNode } from 'react';

type DashboardPageLayoutEditModeProviderProps = {
  pageLayoutId: string;
  children: ReactNode;
};

export const DashboardPageLayoutEditModeProvider = ({
  pageLayoutId,
  children,
}: DashboardPageLayoutEditModeProviderProps) => {
  const isInEditMode = useIsDashboardPageLayoutInEditMode(pageLayoutId);

  return (
    <PageLayoutEditModeProviderContext value={{ isInEditMode }}>
      {children}
    </PageLayoutEditModeProviderContext>
  );
};
