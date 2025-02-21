import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsPath } from '@/types/SettingsPath';
import { SystemHealthService } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

export const SettingsHealthStatusListCard = ({
  services,
  loading,
}: {
  services: Array<SystemHealthService>;
  loading?: boolean;
}) => {
  return (
    <SettingsListCard
      items={services}
      getItemLabel={(service) => service.label}
      isLoading={loading}
      RowRightComponent={({ item: service }) => (
        <SettingsAdminHealthStatusRightContainer status={service.status} />
      )}
      to={(service) =>
        getSettingsPath(SettingsPath.AdminPanelIndicatorHealthStatus, {
          indicatorId: service.id,
        })
      }
    />
  );
};
