import { type ObjectExtensionManifest } from 'twenty-shared/application';
import { isNonEmptyString } from '@sniptt/guards';
import { validateFieldsOrThrow } from './validate-fields';

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

  if (
    !isNonEmptyString(nameSingular) &&
    !isNonEmptyString(universalIdentifier)
  ) {
    throw new Error(
      'targetObject must have either nameSingular or universalIdentifier',
    );
  }

  if (isNonEmptyString(nameSingular) && isNonEmptyString(universalIdentifier)) {
    throw new Error(
      'targetObject cannot have both nameSingular and universalIdentifier - they are mutually exclusive',
    );
  }

  if (!config.fields || config.fields.length === 0) {
    throw new Error('Object extension must have at least one field');
  }

  validateFieldsOrThrow(config.fields);

  return config;
};
