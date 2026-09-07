import {
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';

// These calls reach the application's own resources rather than acting for
// whoever triggered the run, so they take the application token whenever the
// logic function runtime injects one. Front components only ever get the other.
export const getApplicationAccessToken = (): string | undefined =>
  process.env[DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME] ??
  process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];
