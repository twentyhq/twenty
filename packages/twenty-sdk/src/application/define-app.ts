import { type Application } from 'twenty-shared/application';

/**
 * Define an application configuration with validation.
 *
 * @example
 * ```typescript
 * import { defineApp } from 'twenty-sdk';
 * import { APP_ID } from '../src/constants';
 *
 * export default defineApp({
 *   universalIdentifier: APP_ID,
 *   displayName: 'My App',
 *   description: 'My app description',
 *   icon: 'IconWorld',
 * });
 * ```
 */
export const defineApp = <T extends Application>(config: T): T => {
  if (!config.universalIdentifier) {
    throw new Error('App must have a universalIdentifier');
  }

  return config;
};
