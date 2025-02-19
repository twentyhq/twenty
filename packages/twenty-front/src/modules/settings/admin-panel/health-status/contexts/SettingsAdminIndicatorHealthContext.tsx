import { createContext } from 'react';
import {
  AdminPanelHealthServiceData,
  AdminPanelHealthServiceStatus,
  AdminPanelIndicatorHealthStatusInputEnum,
} from '~/generated/graphql';

type SettingsAdminIndicatorHealthContextType = {
  indicatorHealth: AdminPanelHealthServiceDataWithIndicatorName;
  loading: boolean;
};

type AdminPanelHealthServiceDataWithIndicatorName =
  AdminPanelHealthServiceData & {
    indicatorName: AdminPanelIndicatorHealthStatusInputEnum;
  };

export const SettingsAdminIndicatorHealthContext =
  createContext<SettingsAdminIndicatorHealthContextType>({
    indicatorHealth: {
      indicatorName: AdminPanelIndicatorHealthStatusInputEnum.DATABASE,
      status: AdminPanelHealthServiceStatus.OUTAGE,
      details: '',
      queues: [],
    },
    loading: false,
  });
