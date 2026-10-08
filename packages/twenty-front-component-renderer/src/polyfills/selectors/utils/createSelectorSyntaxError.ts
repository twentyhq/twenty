import { createDomException } from '@/polyfills/utils/createDomException';

export const createSelectorSyntaxError = (selectorsText: string): Error =>
  createDomException(
    `'${selectorsText}' is not a valid selector.`,
    'SyntaxError',
  );
