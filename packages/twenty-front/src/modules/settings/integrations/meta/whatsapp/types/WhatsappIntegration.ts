export type IWhatsappIntegration = {
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
