import { glob } from 'fast-glob';
import { FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { manifestExtractFromFileServer } from '@/cli/utilities/build/manifest/manifest-extract-from-file-server';
import { type ValidationError } from '@/cli/utilities/build/manifest/manifest-types';
import {
  type EntityBuildResult,
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from '@/cli/utilities/build/manifest/entities/entity-interface';
import { type FieldManifest } from 'twenty-shared/application';

export class FieldEntityBuilder
  implements ManifestEntityBuilder<FieldManifest>
{
  async build(appPath: string): Promise<EntityBuildResult<FieldManifest>> {
    const fieldFiles = await glob(['**/*.field.ts'], {
      cwd: appPath,
      ignore: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/dist/**',
        '**/.twenty/**',
      ],
    });

    const manifests: FieldManifest[] = [];

    for (const filePath of fieldFiles) {
      try {
        const absolutePath = `${appPath}/${filePath}`;

        const { manifest } =
          await manifestExtractFromFileServer.extractManifestFromFile<FieldManifest>(
            absolutePath,
          );

        manifests.push(manifest);
      } catch (error) {
        throw new Error(
          `Failed to load field from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { manifests, filePaths: fieldFiles };
  }

  validate(fields: FieldManifest[], errors: ValidationError[]): void {
    for (const field of fields) {
      const fieldPath = `fields.${field.label ?? 'unknown'}`;

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

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const fields = manifest.fields;
    const objects = manifest.objects;

    const objectFieldIds = new Map<string, string>();
    for (const obj of objects) {
      for (const field of obj.fields ?? []) {
        if (field.universalIdentifier) {
          const location = `objects/${obj.nameSingular}.fields.${field.label}`;
          objectFieldIds.set(field.universalIdentifier, location);
        }
      }
    }

    const fieldLocations = new Map<string, string[]>();
    for (const field of fields) {
      const targetName = field.objectUniversalIdentifier || 'unknown';
      if (field.universalIdentifier) {
        const location = `objects/${targetName}.fields.${field.label}`;
        const locations = fieldLocations.get(field.universalIdentifier) ?? [];
        locations.push(location);
        fieldLocations.set(field.universalIdentifier, locations);
      }
    }

    const duplicates: EntityIdWithLocation[] = [];

    for (const [id, extLocations] of fieldLocations.entries()) {
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

export const fieldEntityBuilder = new FieldEntityBuilder();
