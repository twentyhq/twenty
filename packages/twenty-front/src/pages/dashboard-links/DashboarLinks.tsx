import { DashboardLinksCards } from '@/dashboard-links/components/ui/DashboardLinksCards';
import { DashboardLinksChart } from '@/dashboard-links/components/ui/DashboardLinksChart';
import { DashboardPageContainer } from '@/dashboard-links/components/ui/DashboardLinksPageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
// eslint-disable-next-line no-restricted-imports
import { IconChartBar } from '@tabler/icons-react';

export const DashboardLinks = () => {
  return (
    <DashboardPageContainer>
      <PageContainer>
        <PageHeader title="Dashboard Links" Icon={IconChartBar} />
        <PageBody>
          <DashboardLinksCards />
          <DashboardLinksChart />
        </PageBody>
      </PageContainer>
    </DashboardPageContainer>
  );
};
