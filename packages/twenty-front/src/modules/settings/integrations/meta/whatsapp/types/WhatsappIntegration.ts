export type IWhatsappIntegration = {
  id: string;
  label: string;
  phoneId: string;
  businessAccountId: string;
  accessToken: string;
  appId: string;
  appKey: string;
  workspaceId: string;
  disabled: boolean;
  workspace: {
    id: string;
  };
  sla: number;
};
