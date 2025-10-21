import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useTheme } from '@emotion/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconAppWindow,
  type IconComponent,
  IconDatabase,
  IconServer2,
  IconTool,
  IconUserCircle,
} from 'twenty-ui/display';
import {
  HealthIndicatorId,
  type SystemHealthService,
} from '~/generated-metadata/graphql';

import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

const HealthStatusIcons: { [k in HealthIndicatorId]: IconComponent } = {
  [HealthIndicatorId.database]: IconDatabase,
  [HealthIndicatorId.redis]: IconServer2,
  [HealthIndicatorId.worker]: IconTool,
  [HealthIndicatorId.connectedAccount]: IconUserCircle,
  [HealthIndicatorId.app]: IconAppWindow,
};

export const SettingsAdminHealthStatusListCard = ({
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
