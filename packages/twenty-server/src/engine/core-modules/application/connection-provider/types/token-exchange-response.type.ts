import { PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings';

export type TokenExchangeResponse = {
  accessToken: PlaintextString;
  refreshToken: PlaintextString | null;
  scopes: string[] | null;
};
