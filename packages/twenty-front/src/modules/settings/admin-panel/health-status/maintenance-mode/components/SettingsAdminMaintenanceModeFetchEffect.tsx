import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { GET_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/maintenance-mode/graphql/queries/getMaintenanceMode';
import { adminPanelMaintenanceModeState } from '@/settings/admin-panel/health-status/maintenance-mode/states/adminPanelMaintenanceModeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type GetMaintenanceModeQuery } from '~/generated-metadata/graphql';

export const SettingsAdminMaintenanceModeFetchEffect = () => {
  const { data } = useQuery<GetMaintenanceModeQuery>(GET_MAINTENANCE_MODE, {
    fetchPolicy: 'network-only',
  });

  const setAdminPanelMaintenanceMode = useSetAtomState(
    adminPanelMaintenanceModeState,
  );

  useEffect(() => {
    const maintenanceMode = data?.getMaintenanceMode;

    if (!isDefined(data)) {
      return;
    }

    setAdminPanelMaintenanceMode(maintenanceMode ?? null);
  }, [data, setAdminPanelMaintenanceMode]);

  return null;
};
