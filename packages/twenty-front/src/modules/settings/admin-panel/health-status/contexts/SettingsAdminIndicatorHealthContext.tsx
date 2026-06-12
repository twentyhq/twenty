import { createContext } from 'react';
import {
  AdminPanelHealthServiceStatus,
  HealthIndicatorId,
  type AdminPanelHealthServiceData,
} from '~/generated-admin/graphql';

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
