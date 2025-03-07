import { createContext } from 'react';
import {
  AdminPanelHealthServiceData,
  AdminPanelHealthServiceStatus,
} from '~/generated/graphql';

type SettingsAdminIndicatorHealthContextType = {
  indicatorHealth: AdminPanelHealthServiceData;
};

export const SettingsAdminIndicatorHealthContext =
  createContext<SettingsAdminIndicatorHealthContextType>({
    indicatorHealth: {
      id: '',
      label: '',
      description: '',
      errorMessage: '',
      status: AdminPanelHealthServiceStatus.OPERATIONAL,
      details: '',
      queues: [],
    },
  });
