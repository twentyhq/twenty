import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';

import { SettingsListCard } from '../../components/SettingsListCard';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

export const SettingsHealthStatusListCard = ({
  services,
  loading,
}: {
  services: Array<AdminHealthService>;
  loading?: boolean;
}) => {
  return (
    <>
      <SettingsListCard
        items={services}
        getItemLabel={(service) => service.name}
        isLoading={loading}
        RowRightComponent={({ item: service }) => (
          <SettingsAdminHealthStatusRightContainer service={service} />
        )}
      />
    </>
  );
};
