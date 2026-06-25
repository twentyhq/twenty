export type EnterpriseKeyPayload = {
  sub: string;
  licensee: string;
  iat: number;
};

export type EnterpriseValidityPayload = {
  sub: string;
  status: 'valid';
  iat: number;
  exp: number;
};

export type EnterpriseLicenseInfo = {
  isValid: boolean;
  licensee: string | null;
  expiresAt: Date | null;
  subscriptionId: string | null;
};

export type EnterpriseInstanceMetadata = {
  serverId: string | null;
  serverUrl: string | null;
  appVersion: string | null;
  nodeEnv: string | null;
  telemetryEnabled: boolean | null;
  workspaceCount: number | null;
  activeUserWorkspaceCount: number | null;
  distinctUserCount: number | null;
  adminContactEmail: string | null;
  sentAt: string;
};
