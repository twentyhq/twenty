import { isNonEmptyString } from '@sniptt/guards';

import { FIREFLIES_API_KEY_VARIABLE_KEY } from 'src/constants/fireflies-api-key-variable-key.constant';

export const getFirefliesApiKey = ():
  | { success: true; apiKey: string }
  | { success: false; error: string } => {
  const apiKey = process.env[FIREFLIES_API_KEY_VARIABLE_KEY];

  if (!isNonEmptyString(apiKey)) {
    return {
      success: false,
      error:
        'Fireflies is not configured. Open the Fireflies app settings and set the FIREFLIES_API_KEY application variable (Fireflies → Integrations → Fireflies API → Generate API key).',
    };
  }

  return { success: true, apiKey };
};
