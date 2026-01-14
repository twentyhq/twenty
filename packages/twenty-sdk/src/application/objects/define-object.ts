import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectManifest } from 'twenty-shared/application';
import { validateFieldsOrThrow } from './validate-fields';

/**
 * Define an object configuration with validation.
 *
 * @example
 * ```typescript
 * import { defineObject, FieldType } from 'twenty-sdk';
 * import { POST_CARD_ID, STATUS_OPTIONS } from '../../src/constants';
 *
 * export default defineObject({
 *   universalIdentifier: POST_CARD_ID,
 *   nameSingular: 'postCard',
 *   namePlural: 'postCards',
 *   labelSingular: 'Post Card',
 *   labelPlural: 'Post Cards',
 *   icon: 'IconMail',
 *   fields: [
 *     {
 *       universalIdentifier: '...',
 *       name: 'content',
 *       type: FieldType.TEXT,
 *       label: 'Content',
 *     },
 *     {
 *       universalIdentifier: '...',
 *       name: 'status',
 *       type: FieldType.SELECT,
 *       label: 'Status',
 *       options: STATUS_OPTIONS,
 *     },
 *   ],
 * });
 * ```
 */
export const defineObject = <T extends ObjectManifest>(config: T): T => {
  if (!isNonEmptyString(config.universalIdentifier)) {
    throw new Error('Object must have a universalIdentifier');
  }

  if (!isNonEmptyString(config.nameSingular)) {
    throw new Error('Object must have a nameSingular');
  }

  if (!isNonEmptyString(config.namePlural)) {
    throw new Error('Object must have a namePlural');
  }

  if (!isNonEmptyString(config.labelSingular)) {
    throw new Error('Object must have a labelSingular');
  }

  if (!isNonEmptyString(config.labelPlural)) {
    throw new Error('Object must have a labelPlural');
  }

  validateFieldsOrThrow(config.fields);

  return config;
};
