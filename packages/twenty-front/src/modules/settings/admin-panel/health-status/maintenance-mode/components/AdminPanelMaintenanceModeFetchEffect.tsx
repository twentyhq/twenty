import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { adminPanelMaintenanceModeState } from '@/settings/admin-panel/health-status/maintenance-mode/states/adminPanelMaintenanceModeState';
import {
  GET_MAINTENANCE_MODE,
  type GetMaintenanceModeResult,
} from '@/settings/admin-panel/health-status/maintenance-mode/graphql/queries/getMaintenanceMode';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AdminPanelMaintenanceModeFetchEffect = () => {
  const { data } = useQuery<GetMaintenanceModeResult>(GET_MAINTENANCE_MODE, {
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
