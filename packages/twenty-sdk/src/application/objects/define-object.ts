import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectManifest } from 'twenty-shared/application';

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
  if (!config.universalIdentifier) {
    throw new Error('Object must have a universalIdentifier');
  }

  if (!config.nameSingular) {
    throw new Error('Object must have a nameSingular');
  }

  if (!config.namePlural) {
    throw new Error('Object must have a namePlural');
  }

  if (!config.labelSingular) {
    throw new Error('Object must have a labelSingular');
  }

  if (!config.labelPlural) {
    throw new Error('Object must have a labelPlural');
  }

  // Validate each field
  for (const field of config.fields ?? []) {
    if (!field.universalIdentifier) {
      throw new Error(`Field "${field.label}" must have a universalIdentifier`);
    }

    if (!field.type) {
      throw new Error(`Field "${field.label}" must have a type`);
    }

    if (!field.name) {
      throw new Error('Field must have a name');
    }

    if (!field.label) {
      throw new Error('Field must have a label');
    }

    // Validate SELECT fields have options
    if (
      (field.type === FieldMetadataType.SELECT ||
        field.type === FieldMetadataType.MULTI_SELECT) &&
      (!field.options || field.options.length === 0)
    ) {
      throw new Error(
        `Field "${field.label}" is a SELECT/MULTI_SELECT type and must have options`,
      );
    }
  }

  return config;
};
