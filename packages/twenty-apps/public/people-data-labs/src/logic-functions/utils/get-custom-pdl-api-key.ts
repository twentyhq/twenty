import { isNonEmptyString } from '@sniptt/guards';

export const getCustomPdlApiKey = (): string | undefined => {
  const apiKey = process.env.PDL_CUSTOM_API_KEY?.trim();

  return isNonEmptyString(apiKey) ? apiKey : undefined;
};
