import { isNonEmptyString } from '@sniptt/guards';

import {
  MICROSOFT_CLIENT_ID_VARIABLE,
  MICROSOFT_CLIENT_SECRET_VARIABLE,
  MICROSOFT_TENANT_ID_VARIABLE,
} from 'src/constants/teams.constant';

type MicrosoftCredentials = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
};

// Application variables are injected into process.env on every execution.
const readRequiredVariable = (name: string): string => {
  const value = process.env[name];

  if (!isNonEmptyString(value)) {
    throw new Error(
      `${name} is not set. Configure it in the Teams Transcripts app variables.`,
    );
  }

  return value.trim();
};

export const getMicrosoftCredentials = (): MicrosoftCredentials => ({
  tenantId: readRequiredVariable(MICROSOFT_TENANT_ID_VARIABLE),
  clientId: readRequiredVariable(MICROSOFT_CLIENT_ID_VARIABLE),
  clientSecret: readRequiredVariable(MICROSOFT_CLIENT_SECRET_VARIABLE),
});
