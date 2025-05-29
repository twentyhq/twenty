type IWhatsappIntegration = {
  id: string;
  name: string;
  phoneId: string;
  businessAccountId: string;
  accessToken: string;
  appId: string;
  appKey: string;
  disabled: boolean;
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
