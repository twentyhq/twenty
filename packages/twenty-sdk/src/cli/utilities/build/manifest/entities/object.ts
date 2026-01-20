import chalk from 'chalk';
import { glob } from 'fast-glob';
import { posix, relative, sep } from 'path';
import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { extractManifestFromFile } from '../manifest-file-extractor';
import { type ValidationError } from '../manifest.types';

const toPosixRelative = (filepath: string, appPath: string): string => {
  const rel = relative(appPath, filepath);
  return rel.split(sep).join(posix.sep);
};

export const buildObjects = async (appPath: string): Promise<ObjectManifest[]> => {
  const objectFiles = await glob(['src/app/**/*.object.ts'], {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
  });

  const objectManifests: ObjectManifest[] = [];

  for (const filepath of objectFiles) {
    try {
      objectManifests.push(
        await extractManifestFromFile<ObjectManifest>(filepath, appPath),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load object from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return objectManifests;
};

export const validateObjects = (
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

export const displayObjects = (objects: ObjectManifest[]): void => {
  console.log(chalk.green(`  ✓ Found ${objects.length} object(s)`));
};

export const collectObjectIds = (
  objects: ObjectManifest[],
): Array<{ id: string; location: string }> => {
  const ids: Array<{ id: string; location: string }> = [];

  for (const obj of objects) {
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

  return ids;
};
