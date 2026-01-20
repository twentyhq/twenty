import { toPosixRelative } from '@/cli/utilities/file/utils/file-path';
import { glob } from 'fast-glob';
import { type ObjectExtensionManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { extractManifestFromFile } from '../manifest-file-extractor';
import { type ValidationError } from '../manifest.types';
import {
  type DuplicateId,
  type ManifestEntityBuilder,
} from './entity.interface';

export class ObjectExtensionEntityBuilder
  implements ManifestEntityBuilder<ObjectExtensionManifest[]>
{
  async build(appPath: string): Promise<ObjectExtensionManifest[]> {
    const extensionFiles = await glob(['src/app/**/*.object-extension.ts'], {
      cwd: appPath,
      absolute: true,
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
    });

    const objectExtensionManifests: ObjectExtensionManifest[] = [];

    for (const filepath of extensionFiles) {
      try {
        objectExtensionManifests.push(
          await extractManifestFromFile<ObjectExtensionManifest>(
            filepath,
            appPath,
          ),
        );
      } catch (error) {
        const relPath = toPosixRelative(filepath, appPath);
        throw new Error(
          `Failed to load object extension from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return objectExtensionManifests;
  }

  validate(
    extensions: ObjectExtensionManifest[],
    errors: ValidationError[],
  ): void {
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
  }

  display(_extensions: ObjectExtensionManifest[]): void {
    // Object extensions don't have a dedicated display - they're part of the manifest
  }

  findDuplicates(extensions: ObjectExtensionManifest[]): DuplicateId[] {
    const seen = new Map<string, string[]>();

    for (const ext of extensions) {
      const targetName =
        ext.targetObject?.nameSingular ??
        ext.targetObject?.universalIdentifier ??
        'unknown';
      for (const field of ext.fields ?? []) {
        if (field.universalIdentifier) {
          const location = `object-extensions/${targetName}.fields.${field.label}`;
          const locations = seen.get(field.universalIdentifier) ?? [];
          locations.push(location);
          seen.set(field.universalIdentifier, locations);
        }

      }
    }

    return Array.from(seen.entries())
      .filter(([_, locations]) => locations.length > 1)
      .map(([id, locations]) => ({ id, locations }));
  }
}

export const objectExtensionEntityBuilder = new ObjectExtensionEntityBuilder();
