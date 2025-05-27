type IBillingPlan = {
  planId: string;
  workspaceId: string;
  workspace: {
    id: string;
  };
};

export type GetBillingPlan = Omit<IBillingPlan, 'workspaceId'>;

export type BillingPlan = Omit<
  IBillingPlan,
  'workspaceId' | 'workspace'
>;