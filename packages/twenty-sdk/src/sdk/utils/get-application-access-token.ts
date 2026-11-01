import {
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application-runtime';

// These reach the application's own resources, so prefer the application token when the runtime injects one
export const getApplicationAccessToken = (): string | undefined =>
  process.env[DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME] ??
  process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

// what the default API clients send: the person who triggered the run, within the app's role, else the app
export const getCallerAccessToken = (): string | undefined =>
  process.env[DEFAULT_APP_ACCESS_TOKEN_NAME] ??
  process.env[DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME];
