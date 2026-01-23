import { type RoleConfig } from '@/application/role-config';

/**
 * Define a role configuration with validation.
 *
 * @example
 * ```typescript
 * import { defineRole, PermissionFlag } from 'twenty-sdk';
 *
 * export default defineRole({
 *   universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
 *   label: 'App User',
 *   description: 'Standard user role for the app',
 *   icon: 'IconUser',
 *   canReadAllObjectRecords: false,
 *   objectPermissions: [
 *     {
 *       objectNameSingular: 'postCard',
 *       canReadObjectRecords: true,
 *       canUpdateObjectRecords: true,
 *     },
 *   ],
 *   permissionFlags: [PermissionFlag.UPLOAD_FILE],
 * });
 * ```
 */
export const defineRole = <T extends RoleConfig>(config: T): T => {
  if (!config.universalIdentifier) {
    throw new Error('Role must have a universalIdentifier');
  }

  if (!config.label) {
    throw new Error('Role must have a label');
  }

  // Validate object permissions if provided
  if (config.objectPermissions) {
    for (const permission of config.objectPermissions) {
      if (
        !permission.objectNameSingular &&
        !permission.objectUniversalIdentifier
      ) {
        throw new Error(
          'Object permission must have either objectNameSingular or objectUniversalIdentifier',
        );
      }
    }
  }

  // Validate field permissions if provided
  if (config.fieldPermissions) {
    for (const permission of config.fieldPermissions) {
      if (
        !permission.objectNameSingular &&
        !permission.objectUniversalIdentifier
      ) {
        throw new Error(
          'Field permission must have either objectNameSingular or objectUniversalIdentifier',
        );
      }
      if (!permission.fieldName && !permission.fieldUniversalIdentifier) {
        throw new Error(
          'Field permission must have either fieldName or fieldUniversalIdentifier',
        );
      }
    }
  }

  return config;
};
