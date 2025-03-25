/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { IconChartBar } from '@tabler/icons-react';

import { DashboardLinksCards } from '@/dashboard-links/components/ui/DashboardLinksCards';
import { DashboardLinksChart } from '@/dashboard-links/components/ui/DashboardLinksChart';
import { DashboardPageContainer } from '@/dashboard-links/components/ui/DashboardLinksPageContainer';
import { getLinklogs } from '@/traceable-access-logs/graphql/queries/getTraceableAccessLogs'; // Ajuste o caminho conforme necessário
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useQuery } from '@apollo/client';

import groupLinkLogsData from '~/utils/groupLinkLogsData';

export const DashboardLinks = () => {
  const { data, loading, error } = useQuery<LinkLogsData>(getLinklogs, {
    variables: {
      filter: {},
      orderBy: [{ position: 'AscNullsFirst' }],
      limit: 100,
      lastCursor: null,
    },
  });

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao buscar dados!</p>;

  const linkLogs =
    data?.linklogs?.edges?.map((edge: LinkLogEdge) => edge.node) || [];
  const chartData = groupLinkLogsData(linkLogs);

  return (
    <DashboardPageContainer>
      <PageContainer>
        <PageHeader title="Dashboard Links" Icon={IconChartBar} />
        <PageBody>
          <DashboardLinksCards chartData={linkLogs} />
          <DashboardLinksChart chartData={chartData} />
        </PageBody>
      </PageContainer>
    </DashboardPageContainer>
  );
};
