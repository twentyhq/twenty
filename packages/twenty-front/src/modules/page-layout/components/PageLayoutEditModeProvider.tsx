import { useIsGlobalLayoutCustomizationActive } from '@/app/hooks/useIsGlobalLayoutCustomizationActive';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { useIsDashboardPageLayoutInEditMode } from '@/page-layout/hooks/useIsDashboardPageLayoutInEditMode';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

type RecordPageLayoutEditModeProviderProps = {
  children: ReactNode;
};

const RecordPageLayoutEditModeProvider = ({
  children,
}: RecordPageLayoutEditModeProviderProps) => {
  const isInEditMode = useIsGlobalLayoutCustomizationActive();

  return (
    <PageLayoutEditModeProviderContext value={{ isInEditMode }}>
      {children}
    </PageLayoutEditModeProviderContext>
  );
};

type DashboardPageLayoutEditModeProviderProps = {
  pageLayoutId: string;
  children: ReactNode;
};

const DashboardPageLayoutEditModeProvider = ({
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

type PageLayoutEditModeProviderProps = {
  layoutType: PageLayoutType;
  pageLayoutId: string;
  children: ReactNode;
};

export const PageLayoutEditModeProvider = ({
  layoutType,
  pageLayoutId,
  children,
}: PageLayoutEditModeProviderProps) => {
  if (layoutType === PageLayoutType.RECORD_PAGE) {
    return (
      <RecordPageLayoutEditModeProvider>
        {children}
      </RecordPageLayoutEditModeProvider>
    );
  }

  return (
    <DashboardPageLayoutEditModeProvider pageLayoutId={pageLayoutId}>
      {children}
    </DashboardPageLayoutEditModeProvider>
  );
};
