import { type Dashboard } from '@/dashboards/components/types/Dashboard';
import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { normalizePageLayoutData } from '@/page-layout/utils/normalizePageLayoutData';
import { useQuery } from '@apollo/client';

type DashboardRendererProps = {
  recordId: string;
};

export const DashboardRenderer = ({ recordId }: DashboardRendererProps) => {
  const { record: dashboard, loading: dashboardLoading } =
    useFindOneRecord<Dashboard>({
      objectNameSingular: CoreObjectNameSingular.Dashboard,
      objectRecordId: recordId,
    });

  const { data } = useQuery(FIND_ONE_PAGE_LAYOUT, {
    variables: {
      id: dashboard?.pageLayoutId,
    },
    skip: dashboardLoading || !dashboard?.pageLayoutId,
  });

  const pageLayout = data?.getPageLayout;

  if (!pageLayout) {
    return null;
  }

  const normalizedPageLayout = normalizePageLayoutData(pageLayout);

  return <PageLayoutRenderer pageLayout={normalizedPageLayout} />;
};
