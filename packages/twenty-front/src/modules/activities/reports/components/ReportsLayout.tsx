import { PropsWithChildren } from 'react';
import { IconReportAnalytics } from 'twenty-ui';

import { PageAddReportButton } from '@/activities/reports/components/PageAddReportButton';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';

interface ReportsLayoutProps extends PropsWithChildren {
  hasBackButton?: boolean;
}

export const ReportsLayout = (props: ReportsLayoutProps) => (
  <PageContainer>
    <RecordFieldValueSelectorContextProvider>
      <PageHeader
        title="Reports"
        Icon={IconReportAnalytics}
        hasBackButton={props.hasBackButton}
      >
        <PageAddReportButton />
      </PageHeader>
      <PageBody>{props.children}</PageBody>
    </RecordFieldValueSelectorContextProvider>
  </PageContainer>
);
