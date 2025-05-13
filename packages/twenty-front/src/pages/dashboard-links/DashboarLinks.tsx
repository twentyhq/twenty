/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { IconChartBar } from '@tabler/icons-react';

import { DashboardLinksChart } from '@/dashboard-links/components/DashboardLinksChart';
import { DashboardPageContainer } from '@/dashboard-links/components/ui/DashboardLinksPageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { DashboardLinksPageBodyLoader } from '@/dashboard-links/components/ui/DashboardLinksPageBodyLoader';
import { GET_DASHBOARD_LINKLOGS } from '@/dashboard-links/graphql/queries/getDashboardLinklogs';
import { useQuery } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { Query } from '~/generated-metadata/graphql';
import { groupLinkLogsData } from '~/utils/groupLinkLogsData';

export const DashboardLinks = () => {
  const { data, loading, error } = useQuery<
    Pick<Query, 'getDashboardLinklogs'>
  >(GET_DASHBOARD_LINKLOGS);

  if (isDefined(error))
    throw new Error(error?.message ?? 'No Data', {
      cause: error?.cause ?? JSON.stringify(data),
    });

  const chartData = groupLinkLogsData(data?.getDashboardLinklogs ?? []);

  return (
    <DashboardPageContainer>
      <PageHeader title="Dashboard Links" Icon={IconChartBar} />
      <PageBody>
        {loading ? (
          <DashboardLinksPageBodyLoader />
        ) : (
          <DashboardLinksChart chartData={chartData} />
        )}
      </PageBody>
    </DashboardPageContainer>
  );
};
