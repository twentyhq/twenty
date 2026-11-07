import { type AdminApplicationMonitoringData } from '@/settings/admin-panel/apps/types/AdminApplicationMonitoringData';

export type AdminApplicationMonitoringWorkspace = Pick<
  AdminApplicationMonitoringData['workspaces'][number],
  'workspaceId' | 'workspaceName'
>;
