import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { getCustomPdlApiKey } from 'src/logic-functions/utils/get-custom-pdl-api-key';
import { isValidPdlApiKey } from 'src/logic-functions/utils/is-valid-pdl-api-key';
import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

export const getPdlApiKey = (): string => {
  const customApiKey = getCustomPdlApiKey();

  if (isDefined(customApiKey) && !isValidPdlApiKey(customApiKey)) {
    throw new PdlConfigError(
      'Your People Data Labs API key contains characters that are not allowed. Paste it again in Settings -> Apps -> People Data Labs -> Variables.',
    );
  }

  const apiKey = customApiKey ?? toText(process.env.PDL_API_KEY);

  if (!isDefined(apiKey)) {
    throw new PdlConfigError(
      'No People Data Labs API key is configured. Add your People Data Labs API key in Settings -> Apps -> People Data Labs -> Variables, or ask your server admin to set PDL_API_KEY.',
    );
  }

  return apiKey;
};
