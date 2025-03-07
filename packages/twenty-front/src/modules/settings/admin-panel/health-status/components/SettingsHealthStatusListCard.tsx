import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import {
  IconAppWindow,
  IconComponent,
  IconDatabase,
  IconServer2,
  IconTool,
  IconUserCircle,
} from 'twenty-ui';
import { SystemHealthService } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

const HealthStatusIcons: { [k: string]: IconComponent } = {
  database: IconDatabase,
  redis: IconServer2,
  worker: IconTool,
  connectedAccount: IconUserCircle,
  app: IconAppWindow,
};

export const SettingsHealthStatusListCard = ({
  services,
  loading,
}: {
  services: Array<SystemHealthService>;
  loading?: boolean;
}) => {
  const theme = useTheme();

  return (
    <SettingsListCard
      items={services}
      rounded={true}
      RowIconFn={(row) => HealthStatusIcons[row.id]}
      RowIconColor={theme.font.color.tertiary}
      getItemLabel={(service) => service.label}
      isLoading={loading}
      RowRightComponent={({ item: service }) => (
        <SettingsAdminHealthStatusRightContainer status={service.status} />
      )}
      to={(service) =>
        getSettingsPath(SettingsPath.ServerAdminIndicatorHealthStatus, {
          indicatorId: service.id,
        })
      }
    />
  );
};
