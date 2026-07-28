import { isNonEmptyString } from '@sniptt/guards';

export const FIREFLIES_API_KEY_ENV_VAR = 'FIREFLIES_API_KEY';

export const getFirefliesApiKey = ():
  | { success: true; apiKey: string }
  | { success: false; error: string } => {
  const apiKey = process.env[FIREFLIES_API_KEY_ENV_VAR];

  if (!isNonEmptyString(apiKey)) {
    return {
      success: false,
      error:
        'Fireflies is not configured. Open the Twenty Fireflies app settings and set the FIREFLIES_API_KEY application variable (Fireflies → Integrations → Fireflies API → Generate API key).',
    };
  }

  return { success: true, apiKey };
};
