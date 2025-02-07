type IWhatsappIntegration = {
  id: string;
  label: string;
  phoneNumber: string;
  phoneId: string;
  businessAccountId: string;
  accessToken: string;
  appId: string;
  appKey: string;
  token: string;
  workspaceId: string;
  disabled: boolean;
  workspace: {
    id: string;
  };
  sla: number;
};

export type CreateWhatsappIntegrationInput = Omit<
  IWhatsappIntegration,
  'id' | 'workspaceId' | 'disabled' | 'workspace' | 'sla'
>;

export type FindWhatsappIntegration = Omit<IWhatsappIntegration, 'workspaceId'>;

export type WhatsappIntegration = Omit<
  IWhatsappIntegration,
  'workspaceId' | 'workspace'
>;

export type UpdateWhatsappIntegrationInput = Omit<
  IWhatsappIntegration,
  'disabled' | 'workspaceId' | 'workspace'
>;
