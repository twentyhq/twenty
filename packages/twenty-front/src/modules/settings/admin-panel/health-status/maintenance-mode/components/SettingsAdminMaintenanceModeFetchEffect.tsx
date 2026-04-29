import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/maintenance-mode/graphql/queries/getMaintenanceMode';
import { adminPanelMaintenanceModeState } from '@/settings/admin-panel/health-status/maintenance-mode/states/adminPanelMaintenanceModeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type GetMaintenanceModeQuery } from '~/generated-admin/graphql';

export const SettingsAdminMaintenanceModeFetchEffect = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { data } = useQuery<GetMaintenanceModeQuery>(GET_MAINTENANCE_MODE, {
    client: apolloAdminClient,
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
