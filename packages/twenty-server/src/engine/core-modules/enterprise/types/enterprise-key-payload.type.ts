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
