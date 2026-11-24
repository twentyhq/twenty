import { isNonEmptyString } from '@sniptt/guards';

export const getUnipileApiKeyOrThrow = (): string => {
  const apiKey = process.env.UNIPILE_API_KEY;

  if (!isNonEmptyString(apiKey)) {
    throw new Error('UNIPILE_API_KEY server variable is not set');
  }

  return apiKey;
};
