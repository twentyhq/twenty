import {
  type ApplicationManifest,
  type ServerlessFunctionManifest,
  type ObjectExtensionManifest,
  type ObjectManifest,
  type RoleManifest,
  type Application,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
} from '../types/manifest.types';

/**
 * Collect all universalIdentifiers from the manifest for duplicate checking.
 */
const collectAllIds = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): Array<{ id: string; location: string }> => {
  const ids: Array<{ id: string; location: string }> = [];

  // Application
  if (manifest.application?.universalIdentifier) {
    ids.push({
      id: manifest.application.universalIdentifier,
      location: 'application',
    });
  }

  // Application variables
  if (manifest.application?.applicationVariables) {
    for (const [name, variable] of Object.entries(
      manifest.application.applicationVariables,
    )) {
      if (variable.universalIdentifier) {
        ids.push({
          id: variable.universalIdentifier,
          location: `application.variables.${name}`,
        });
      }
    }
  }

  // Objects
  for (const obj of manifest.objects ?? []) {
    if (obj.universalIdentifier) {
      ids.push({
        id: obj.universalIdentifier,
        location: `objects/${obj.nameSingular}`,
      });
    }
    // Object fields
    for (const field of obj.fields ?? []) {
      if (field.universalIdentifier) {
        ids.push({
          id: field.universalIdentifier,
          location: `objects/${obj.nameSingular}.fields.${field.label}`,
        });
      }
    }
  }

  for (const ext of manifest.objectExtensions ?? []) {
    const targetName =
      ext.targetObject?.nameSingular ??
      ext.targetObject?.universalIdentifier ??
      'unknown';
    // Extension fields
    for (const field of ext.fields ?? []) {
      if (field.universalIdentifier) {
        ids.push({
          id: field.universalIdentifier,
          location: `object-extensions/${targetName}.fields.${field.label}`,
        });
      }
    }
  }

  // Functions
  for (const fn of manifest.serverlessFunctions ?? []) {
    if (fn.universalIdentifier) {
      ids.push({
        id: fn.universalIdentifier,
        location: `functions/${fn.name ?? fn.handlerName}`,
      });
    }
    // Function triggers
    for (const trigger of fn.triggers ?? []) {
      if (trigger.universalIdentifier) {
        ids.push({
          id: trigger.universalIdentifier,
          location: `functions/${fn.name ?? fn.handlerName}.triggers.${trigger.type}`,
        });
      }
    }
  }

  // Roles
  for (const role of manifest.roles ?? []) {
    if (role.universalIdentifier) {
      ids.push({
        id: role.universalIdentifier,
        location: `roles/${role.label}`,
      });
    }
  }

  return ids;
};

/**
 * Find duplicate universalIdentifiers.
 */
const findDuplicates = (
  ids: Array<{ id: string; location: string }>,
): Array<{ id: string; locations: string[] }> => {
  const seen = new Map<string, string[]>();

  for (const { id, location } of ids) {
    const locations = seen.get(id) ?? [];
    locations.push(location);
    seen.set(id, locations);
  }

  return Array.from(seen.entries())
    .filter(([_, locations]) => locations.length > 1)
    .map(([id, locations]) => ({ id, locations }));
};

/**
 * Validate an application config.
 */
const validateApplication = (
  application: Application | undefined,
  errors: ValidationError[],
): void => {
  if (!application) {
    errors.push({
      path: 'application',
      message: 'Application config is required',
    });
    return;
  }

  if (!application.universalIdentifier) {
    errors.push({
      path: 'application',
      message: 'Application must have a universalIdentifier',
    });
  }
};

/**
 * Validate objects and their fields.
 */
const validateObjects = (
  objects: ObjectManifest[],
  errors: ValidationError[],
): void => {
  for (const obj of objects) {
    const objPath = `objects/${obj.nameSingular ?? 'unknown'}`;

    if (!obj.universalIdentifier) {
      errors.push({
        path: objPath,
        message: 'Object must have a universalIdentifier',
      });
    }

    if (!obj.nameSingular) {
      errors.push({
        path: objPath,
        message: 'Object must have a nameSingular',
      });
    }

    if (!obj.namePlural) {
      errors.push({
        path: objPath,
        message: 'Object must have a namePlural',
      });
    }

    // Validate fields
    for (const field of obj.fields ?? []) {
      const fieldPath = `${objPath}.fields.${field.label ?? 'unknown'}`;

      if (!field.universalIdentifier) {
        errors.push({
          path: fieldPath,
          message: 'Field must have a universalIdentifier',
        });
      }

      if (!field.type) {
        errors.push({
          path: fieldPath,
          message: 'Field must have a type',
        });
      }

      if (!field.label) {
        errors.push({
          path: fieldPath,
          message: 'Field must have a label',
        });
      }

      // Check SELECT/MULTI_SELECT fields have options
      if (
        (field.type === FieldMetadataType.SELECT ||
          field.type === FieldMetadataType.MULTI_SELECT) &&
        (!Array.isArray(field.options) || field.options.length === 0)
      ) {
        errors.push({
          path: fieldPath,
          message: 'SELECT/MULTI_SELECT field must have options',
        });
      }
    }
  }
};

/**
 * Validate object extensions and their fields.
 */
const validateObjectExtensions = (
  extensions: ObjectExtensionManifest[],
  errors: ValidationError[],
): void => {
  for (const ext of extensions) {
    const targetName =
      ext.targetObject?.nameSingular ??
      ext.targetObject?.universalIdentifier ??
      'unknown';
    const extPath = `object-extensions/${targetName}`;

    if (!ext.targetObject) {
      errors.push({
        path: extPath,
        message: 'Object extension must have a targetObject',
      });
      continue;
    }

    const { nameSingular, universalIdentifier } = ext.targetObject;

    if (!nameSingular && !universalIdentifier) {
      errors.push({
        path: extPath,
        message:
          'Object extension targetObject must have either nameSingular or universalIdentifier',
      });
    }

    if (nameSingular && universalIdentifier) {
      errors.push({
        path: extPath,
        message:
          'Object extension targetObject cannot have both nameSingular and universalIdentifier',
      });
    }

    if (!ext.fields || ext.fields.length === 0) {
      errors.push({
        path: extPath,
        message: 'Object extension must have at least one field',
      });
    }

    // Validate fields
    for (const field of ext.fields ?? []) {
      const fieldPath = `${extPath}.fields.${field.label ?? 'unknown'}`;

      if (!field.universalIdentifier) {
        errors.push({
          path: fieldPath,
          message: 'Field must have a universalIdentifier',
        });
      }

      if (!field.type) {
        errors.push({
          path: fieldPath,
          message: 'Field must have a type',
        });
      }

      if (!field.label) {
        errors.push({
          path: fieldPath,
          message: 'Field must have a label',
        });
      }

      // Check SELECT/MULTI_SELECT fields have options
      if (
        (field.type === FieldMetadataType.SELECT ||
          field.type === FieldMetadataType.MULTI_SELECT) &&
        (!Array.isArray(field.options) || field.options.length === 0)
      ) {
        errors.push({
          path: fieldPath,
          message: 'SELECT/MULTI_SELECT field must have options',
        });
      }
    }
  }
};

/**
 * Validate serverless functions.
 */
const validateFunctions = (
  functions: ServerlessFunctionManifest[],
  errors: ValidationError[],
): void => {
  for (const fn of functions) {
    const fnPath = `functions/${fn.name ?? fn.handlerName ?? 'unknown'}`;

    if (!fn.universalIdentifier) {
      errors.push({
        path: fnPath,
        message: 'Function must have a universalIdentifier',
      });
    }

    // Validate triggers
    for (const trigger of fn.triggers ?? []) {
      const triggerPath = `${fnPath}.triggers.${trigger.type ?? 'unknown'}`;

      if (!trigger.universalIdentifier) {
        errors.push({
          path: triggerPath,
          message: 'Trigger must have a universalIdentifier',
        });
      }

      if (!trigger.type) {
        errors.push({
          path: triggerPath,
          message: 'Trigger must have a type',
        });
        continue;
      }

      switch (trigger.type) {
        case 'route':
          if (!trigger.path) {
            errors.push({
              path: triggerPath,
              message: 'Route trigger must have a path',
            });
          }
          if (!trigger.httpMethod) {
            errors.push({
              path: triggerPath,
              message: 'Route trigger must have an httpMethod',
            });
          }
          break;

        case 'cron':
          if (!trigger.pattern) {
            errors.push({
              path: triggerPath,
              message: 'Cron trigger must have a pattern',
            });
          }
          break;

        case 'databaseEvent':
          if (!trigger.eventName) {
            errors.push({
              path: triggerPath,
              message: 'Database event trigger must have an eventName',
            });
          }
          break;
      }
    }
  }
};

/**
 * Validate roles.
 */
const validateRoles = (
  roles: RoleManifest[],
  errors: ValidationError[],
): void => {
  for (const role of roles) {
    const rolePath = `roles/${role.label ?? 'unknown'}`;

    if (!role.universalIdentifier) {
      errors.push({
        path: rolePath,
        message: 'Role must have a universalIdentifier',
      });
    }

    if (!role.label) {
      errors.push({
        path: rolePath,
        message: 'Role must have a label',
      });
    }
  }
};

/**
 * Validate a complete application manifest.
 */
export const validateManifest = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate application
  validateApplication(manifest.application, errors);

  // Validate objects
  validateObjects(manifest.objects ?? [], errors);

  // Validate object extensions
  validateObjectExtensions(manifest.objectExtensions ?? [], errors);

  // Validate functions
  validateFunctions(manifest.serverlessFunctions ?? [], errors);

  // Validate roles
  validateRoles(manifest.roles ?? [], errors);

  // Check for duplicate universalIdentifiers
  const allIds = collectAllIds(manifest);
  const duplicates = findDuplicates(allIds);
  for (const dup of duplicates) {
    errors.push({
      path: dup.locations.join(', '),
      message: `Duplicate universalIdentifier: ${dup.id}`,
    });
  }

  // Warnings
  if (!manifest.objects || manifest.objects.length === 0) {
    warnings.push({
      message: 'No objects defined in src/app/objects/',
    });
  }

  if (
    !manifest.serverlessFunctions ||
    manifest.serverlessFunctions.length === 0
  ) {
    warnings.push({
      message: 'No functions defined in src/app/functions/',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
