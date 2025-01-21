type IStripeIntegration = {
  accountId: string;
  workspaceId: string;
  workspace: {
    id: string;
  };
};

export type FindStripeIntegration = Omit<IStripeIntegration, 'workspaceId'>;

export type StripeIntegration = Omit<
  IStripeIntegration,
  'workspaceId' | 'workspace'
>;
