import { createContext } from 'react';
import {
  type AdminPanelHealthServiceData,
  AdminPanelHealthServiceStatus,
  HealthIndicatorId,
} from '~/generated/graphql';

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
