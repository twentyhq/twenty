import {
  type ApplicationManifest,
  type FrontComponentManifest,
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
} from './manifest.types';

const collectAllIds = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): Array<{ id: string; location: string }> => {
  const ids: Array<{ id: string; location: string }> = [];

  if (manifest.application?.universalIdentifier) {
    ids.push({
      id: manifest.application.universalIdentifier,
      location: 'application',
    });
  }

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

  for (const obj of manifest.objects ?? []) {
    if (obj.universalIdentifier) {
      ids.push({
        id: obj.universalIdentifier,
        location: `objects/${obj.nameSingular}`,
      });
    }
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
    for (const field of ext.fields ?? []) {
      if (field.universalIdentifier) {
        ids.push({
          id: field.universalIdentifier,
          location: `object-extensions/${targetName}.fields.${field.label}`,
        });
      }
    }
  }

  for (const fn of manifest.serverlessFunctions ?? []) {
    if (fn.universalIdentifier) {
      ids.push({
        id: fn.universalIdentifier,
        location: `functions/${fn.name ?? fn.handlerName}`,
      });
    }
    for (const trigger of fn.triggers ?? []) {
      if (trigger.universalIdentifier) {
        ids.push({
          id: trigger.universalIdentifier,
          location: `functions/${fn.name ?? fn.handlerName}.triggers.${trigger.type}`,
        });
      }
    }
  }

  for (const role of manifest.roles ?? []) {
    if (role.universalIdentifier) {
      ids.push({
        id: role.universalIdentifier,
        location: `roles/${role.label}`,
      });
    }
  }

  for (const component of manifest.frontComponents ?? []) {
    if (component.universalIdentifier) {
      ids.push({
        id: component.universalIdentifier,
        location: `front-components/${component.name ?? component.componentName}`,
      });
    }
  }

  return ids;
};

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

const validateFrontComponents = (
  components: FrontComponentManifest[],
  errors: ValidationError[],
): void => {
  for (const component of components) {
    const componentPath = `front-components/${component.name ?? component.componentName ?? 'unknown'}`;

    if (!component.universalIdentifier) {
      errors.push({
        path: componentPath,
        message: 'Front component must have a universalIdentifier',
      });
    }
  }
};

export const validateManifest = (
  manifest: Omit<ApplicationManifest, 'sources'>,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  validateApplication(manifest.application, errors);

  validateObjects(manifest.objects ?? [], errors);

  validateObjectExtensions(manifest.objectExtensions ?? [], errors);

  validateFunctions(manifest.serverlessFunctions ?? [], errors);

  validateRoles(manifest.roles ?? [], errors);

  validateFrontComponents(manifest.frontComponents ?? [], errors);

  const allIds = collectAllIds(manifest);
  const duplicates = findDuplicates(allIds);
  for (const dup of duplicates) {
    errors.push({
      path: dup.locations.join(', '),
      message: `Duplicate universalIdentifier: ${dup.id}`,
    });
  }

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
