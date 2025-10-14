import { type Dashboard } from '@/dashboards/components/types/Dashboard';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { isDefined } from 'twenty-shared/utils';

export const DashboardCard = () => {
  const targetRecord = useTargetRecord();

  const { record: dashboard } = useFindOneRecord<Dashboard>({
    objectNameSingular: CoreObjectNameSingular.Dashboard,
    objectRecordId: targetRecord.id,
  });

  if (!isDefined(dashboard)) {
    return null;
  }

  return <PageLayoutRenderer pageLayoutId={dashboard.pageLayoutId} />;
};
