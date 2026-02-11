import { createContext } from 'react';
import { type AdminPanelHealthServiceData } from '~/generated-metadata/graphql';
import { AdminPanelHealthServiceStatus, HealthIndicatorId } from '~/generated-metadata/graphql';

type SettingsAdminIndicatorHealthContextType = {
  indicatorHealth: AdminPanelHealthServiceData;
};

export const SettingsAdminIndicatorHealthContext =
  createContext<SettingsAdminIndicatorHealthContextType>({
    indicatorHealth: {
      id: HealthIndicatorId.app,
      label: '',
      description: '',
      errorMessage: '',
      status: AdminPanelHealthServiceStatus.OPERATIONAL,
      details: '',
      queues: [],
    },
  });
