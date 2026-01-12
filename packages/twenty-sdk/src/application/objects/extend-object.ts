import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectExtensionManifest } from 'twenty-shared/application';

/**
 * Extend an existing object with additional fields.
 *
 * @example
 * ```typescript
 * import { extendObject, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';
 *
 * // Extend by object name
 * export const companyExtension = extendObject({
 *   targetObject: {
 *     nameSingular: 'company',
 *   },
 *   fields: [
 *     {
 *       universalIdentifier: '...',
 *       name: 'healthScore',
 *       type: FieldType.NUMBER,
 *       label: 'Health Score',
 *       description: 'Calculated customer health metric',
 *     },
 *     {
 *       universalIdentifier: '...',
 *       name: 'churnRisk',
 *       type: FieldType.SELECT,
 *       label: 'Churn Risk',
 *       options: [
 *         { label: 'Low', value: 'low', color: 'green' },
 *         { label: 'Medium', value: 'medium', color: 'yellow' },
 *         { label: 'High', value: 'high', color: 'red' },
 *       ],
 *     },
 *   ],
 * });
 *
 * // Or extend by universal identifier
 * export const companyExtensionById = extendObject({
 *   targetObject: {
 *     universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
 *   },
 *   fields: [...],
 * });
 * ```
 */
export const extendObject = <T extends ObjectExtensionManifest>(
  config: T,
): T => {
  if (!config.targetObject) {
    throw new Error('Object extension must have a targetObject');
  }

  const { nameSingular, universalIdentifier } = config.targetObject;

  if (!nameSingular && !universalIdentifier) {
    throw new Error(
      'targetObject must have either nameSingular or universalIdentifier',
    );
  }

  if (nameSingular && universalIdentifier) {
    throw new Error(
      'targetObject cannot have both nameSingular and universalIdentifier - they are mutually exclusive',
    );
  }

  if (!config.fields || config.fields.length === 0) {
    throw new Error('Object extension must have at least one field');
  }

  // Validate each field
  for (const field of config.fields) {
    if (!field.label) {
      throw new Error('Field must have a label');
    }

    if (!field.name) {
      throw new Error(`Field "${field.label}" must have a name`);
    }

    if (!field.universalIdentifier) {
      throw new Error(`Field "${field.label}" must have a universalIdentifier`);
    }

    // Validate SELECT fields have options
    if (
      (field.type === FieldMetadataType.SELECT ||
        field.type === FieldMetadataType.MULTI_SELECT) &&
      (!field.options || (field.options as unknown[]).length === 0)
    ) {
      throw new Error(
        `Field "${field.label}" is a SELECT/MULTI_SELECT type and must have options`,
      );
    }
  }

  return config;
};
