import { DashboardPageLayoutEditModeProvider } from '@/page-layout/components/DashboardPageLayoutEditModeProvider';
import { RecordPageLayoutEditModeProvider } from '@/page-layout/components/RecordPageLayoutEditModeProvider';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

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
