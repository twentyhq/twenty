import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

export const getIsPlanRequired = ({
  isBillingEnabled,
  currentWorkspace,
}: {
  isBillingEnabled: boolean;
  currentWorkspace: Pick<CurrentWorkspace, 'billingSubscriptions'> | null;
}) =>
  isBillingEnabled &&
  (currentWorkspace?.billingSubscriptions?.length ?? 0) === 0;
