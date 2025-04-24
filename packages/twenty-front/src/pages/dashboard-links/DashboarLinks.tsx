/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { IconChartBar } from '@tabler/icons-react';

import { DashboardLinksChart } from '@/dashboard-links/components/ui/DashboardLinksChart';
import { DashboardPageContainer } from '@/dashboard-links/components/ui/DashboardLinksPageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { GET_DASHBOARD_LINKLOGS } from '@/dashboard-links/graphql/queries/getDashboardLinklogs';
import { useQuery } from '@apollo/client';
import { Query } from '~/generated-metadata/graphql';
import { groupLinkLogsData } from '~/utils/groupLinkLogsData';

export const DashboardLinks = () => {
  const { data, loading, error } = useQuery<
    Pick<Query, 'getDashboardLinklogs'>
  >(GET_DASHBOARD_LINKLOGS);

  if (loading) return <p>Carregando...</p>;
  if (error || !data) return <p>Erro ao buscar dados!</p>;

  const chartData = groupLinkLogsData(data.getDashboardLinklogs);

  return (
    <DashboardPageContainer>
      <PageContainer>
        <PageHeader title="Dashboard Links" Icon={IconChartBar} />
        <PageBody>
          <DashboardLinksChart chartData={chartData} />
        </PageBody>
      </PageContainer>
    </DashboardPageContainer>
  );
};
