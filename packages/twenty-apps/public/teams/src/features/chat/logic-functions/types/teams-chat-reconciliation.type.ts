export type TeamsChatConnectionReconciliation =
  | { connectedAccountId: string; status: 'CLAIMED'; tenantId: string }
  | { connectedAccountId: string; status: 'CONFLICT'; tenantId: string }
  | { connectedAccountId: string; status: 'RELEASED' }
  | { connectedAccountId: string; status: 'FAILED'; error: string };

export type TeamsChatReconciliationResult =
  | {
      success: true;
      isChatEnabled: boolean;
      connections: TeamsChatConnectionReconciliation[];
    }
  | { success: false; message: string; error: string };
