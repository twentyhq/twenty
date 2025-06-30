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
} from 'twenty-ui/display';
import {
  HealthIndicatorId,
  SystemHealthService,
} from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

const HealthStatusIcons: { [k in HealthIndicatorId]: IconComponent } = {
  [HealthIndicatorId.database]: IconDatabase,
  [HealthIndicatorId.redis]: IconServer2,
  [HealthIndicatorId.worker]: IconTool,
  [HealthIndicatorId.connectedAccount]: IconUserCircle,
  [HealthIndicatorId.app]: IconAppWindow,
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
        getSettingsPath(SettingsPath.AdminPanelIndicatorHealthStatus, {
          indicatorId: service.id,
        })
      }
    />
  );
};
