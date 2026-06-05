import { isNonEmptyString } from '@sniptt/guards';

import { PdlConfigError } from 'src/logic-functions/utils/pdl-config-error';

export const getPdlApiKey = (): string => {
  const apiKey = process.env.PDL_API_KEY;

  if (!isNonEmptyString(apiKey) || apiKey.trim() === '') {
    throw new PdlConfigError(
      'PDL_API_KEY is not set. The workspace admin must configure the People Data Labs API key in Settings -> Apps.',
    );
  }

  return apiKey;
};
