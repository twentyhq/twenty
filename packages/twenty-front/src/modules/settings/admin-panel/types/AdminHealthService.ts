import {
  AdminPanelHealthServiceData,
  AdminPanelWorkerQueueHealth,
} from '~/generated/graphql';

type AdminWorkerService = AdminPanelHealthServiceData & {
  id: string;
  name: string;
  queues: AdminPanelWorkerQueueHealth[] | null | undefined;
};

export type AdminHealthService = AdminWorkerService;
