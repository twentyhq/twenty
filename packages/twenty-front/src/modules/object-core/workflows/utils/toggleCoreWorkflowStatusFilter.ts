import { type CoreWorkflowStatus } from '~/generated/graphql';

export const toggleCoreWorkflowStatusFilter = (
  statuses: CoreWorkflowStatus[],
  status: CoreWorkflowStatus,
): CoreWorkflowStatus[] =>
  statuses.includes(status)
    ? statuses.filter((existingStatus) => existingStatus !== status)
    : [...statuses, status];
