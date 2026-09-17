import { isNonEmptyString } from '@sniptt/guards';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { getCustomPdlApiKey } from 'src/logic-functions/utils/get-custom-pdl-api-key';

export const getPdlApiKey = (): string => {
  const apiKey = getCustomPdlApiKey() ?? process.env.PDL_API_KEY?.trim();

  if (!isNonEmptyString(apiKey)) {
    throw new PdlConfigError(
      'No People Data Labs API key is configured. The workspace admin can set PDL_CUSTOM_API_KEY in Settings -> Apps, or the server admin can configure the Twenty-managed PDL_API_KEY.',
    );
  }

  return apiKey;
};
