import { SettingsAdminAccountSyncMetricContent } from '@/settings/admin-panel/health-status/components/SettingsAdminAccountSyncMetricContent';
import {
  AdminPanelIndicatorHealthStatusInputEnum,
  useGetIndicatorHealthStatusQuery,
} from '~/generated/graphql';

export const AccountSyncMetrics = () => {
  const { data } = useGetIndicatorHealthStatusQuery({
    variables: {
      indicatorName: AdminPanelIndicatorHealthStatusInputEnum.ACCOUNT_SYNC,
    },
    fetchPolicy: 'network-only',
  });
  return (
    <SettingsAdminAccountSyncMetricContent
      details={data?.getIndicatorHealthStatus.details}
    />
  );
};
