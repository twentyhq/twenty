import { createContext } from 'react';
import {
  AdminPanelHealthServiceData,
  AdminPanelHealthServiceStatus,
} from '~/generated/graphql';

type SettingsAdminIndicatorHealthContextType = {
  indicatorHealth: AdminPanelHealthServiceData;
  loading: boolean;
};

export const SettingsAdminIndicatorHealthContext =
  createContext<SettingsAdminIndicatorHealthContextType>({
    indicatorHealth: {
      id: '',
      label: '',
      description: '',
      status: AdminPanelHealthServiceStatus.OPERATIONAL,
      details: '',
      queues: [],
    },
    loading: false,
  });
