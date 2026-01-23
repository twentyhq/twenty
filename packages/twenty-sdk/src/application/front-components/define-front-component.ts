import { type FrontComponentConfig } from '@/application/front-components/front-component-config';

/**
 * Define a front component configuration with validation.
 *
 * @example
 * ```typescript
 * import { defineFrontComponent } from 'twenty-sdk';
 *
 * const MyComponent = () => {
 *   return <div>Hello World</div>;
 * };
 *
 * export default defineFrontComponent({
 *   universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
 *   name: 'My Component',
 *   description: 'A sample front component',
 *   component: MyComponent,
 * });
 * ```
 */
export const defineFrontComponent = <T extends FrontComponentConfig>(
  config: T,
): T => {
  if (!config.universalIdentifier) {
    throw new Error('FrontComponent must have a universalIdentifier');
  }

  if (typeof config.component !== 'function') {
    throw new Error('FrontComponent must have a component');
  }

  return config;
};
