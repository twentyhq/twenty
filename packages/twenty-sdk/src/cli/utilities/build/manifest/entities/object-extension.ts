import { toPosixRelative } from '@/cli/utilities/file/utils/file-path';
import { glob } from 'fast-glob';
import { type ObjectExtensionManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { manifestExtractFromFileServer } from '../manifest-extract-from-file-server';
import { type ValidationError } from '../manifest.types';
import {
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from './entity.interface';

export class ObjectExtensionEntityBuilder
  implements ManifestEntityBuilder<ObjectExtensionManifest[]>
{
  async build(appPath: string): Promise<ObjectExtensionManifest[]> {
    const extensionFiles = await glob(['src/**/*.object-extension.ts'], {
      cwd: appPath,
      absolute: true,
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
    });

    const objectExtensionManifests: ObjectExtensionManifest[] = [];

    for (const filepath of extensionFiles) {
      try {
        objectExtensionManifests.push(
          await manifestExtractFromFileServer.extractManifestFromFile<ObjectExtensionManifest>(filepath),
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

      if (!isNonEmptyArray(ext.fields)) {
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
          !isNonEmptyArray(field.options)
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

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const extensions = manifest.objectExtensions ?? [];
    const objects = manifest.objects ?? [];

    const objectFieldIds = new Map<string, string>();
    for (const obj of objects) {
      for (const field of obj.fields ?? []) {
        if (field.universalIdentifier) {
          const location = `objects/${obj.nameSingular}.fields.${field.label}`;
          objectFieldIds.set(field.universalIdentifier, location);
        }
      }
    }

    const extensionFieldLocations = new Map<string, string[]>();
    for (const ext of extensions) {
      const targetName =
        ext.targetObject?.nameSingular ??
        ext.targetObject?.universalIdentifier ??
        'unknown';
      for (const field of ext.fields ?? []) {
        if (field.universalIdentifier) {
          const location = `object-extensions/${targetName}.fields.${field.label}`;
          const locations =
            extensionFieldLocations.get(field.universalIdentifier) ?? [];
          locations.push(location);
          extensionFieldLocations.set(field.universalIdentifier, locations);
        }
      }
    }

    const duplicates: EntityIdWithLocation[] = [];

    for (const [id, extLocations] of extensionFieldLocations.entries()) {
      const objectLocation = objectFieldIds.get(id);

      if (extLocations.length > 1 || objectLocation) {
        const allLocations = objectLocation
          ? [objectLocation, ...extLocations]
          : extLocations;
        duplicates.push({ id, locations: allLocations });
      }
    }

    return duplicates;
  }
}

export const objectExtensionEntityBuilder = new ObjectExtensionEntityBuilder();
