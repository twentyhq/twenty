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

// Diagnostic metadata reported alongside the enterprise key on the license
// validation channel (/validate, /seats). Enterprise-only: nothing here is sent
// unless an ENTERPRISE_KEY is configured. Every field is best-effort and may be
// null — gathering it must never block a license refresh. No CRM data is
// included; adminContactEmail is a single administrative contact, not a fraud
// signal.
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
