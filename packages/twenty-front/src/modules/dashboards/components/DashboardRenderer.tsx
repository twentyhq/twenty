import { type Dashboard } from '@/dashboards/components/types/Dashboard';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { isDefined } from 'twenty-shared/utils';

type DashboardRendererProps = {
  recordId: string;
};

export const DashboardRenderer = ({ recordId }: DashboardRendererProps) => {
  const { record: dashboard } = useFindOneRecord<Dashboard>({
    objectNameSingular: CoreObjectNameSingular.Dashboard,
    objectRecordId: recordId,
  });

  if (!isDefined(dashboard)) {
    return null;
  }

  return <PageLayoutRenderer pageLayoutId={dashboard.pageLayoutId} />;
};
