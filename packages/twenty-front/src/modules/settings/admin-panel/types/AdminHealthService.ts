import {
  AdminPanelHealthService,
  AdminPanelWorkerQueueHealth,
} from '~/generated/graphql';

type AdminWorkerService = AdminPanelHealthService & {
  id: string;
  name: string;
  queues: AdminPanelWorkerQueueHealth[] | null | undefined;
};

export type AdminHealthService = AdminWorkerService;
