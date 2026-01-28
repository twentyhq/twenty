import { glob } from 'fast-glob';
import { type ObjectManifest } from 'twenty-shared/application';
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

export class ObjectEntityBuilder
  implements ManifestEntityBuilder<ObjectManifest>
{
  async build(appPath: string): Promise<EntityBuildResult<ObjectManifest>> {
    const objectFiles = await glob(['**/*.object.ts'], {
      cwd: appPath,
      ignore: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/dist/**',
        '**/.twenty/**',
      ],
    });

    const manifests: ObjectManifest[] = [];

    for (const filePath of objectFiles) {
      try {
        const absolutePath = `${appPath}/${filePath}`;

        const { manifest } =
          await manifestExtractFromFileServer.extractManifestFromFile<ObjectManifest>(
            absolutePath,
          );

        manifests.push(manifest);
      } catch (error) {
        throw new Error(
          `Failed to load object from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { manifests, filePaths: objectFiles };
  }

  validate(objects: ObjectManifest[], errors: ValidationError[]): void {
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

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const seen = new Map<string, string[]>();
    const objects = manifest.objects ?? [];

    for (const obj of objects) {
      if (obj.universalIdentifier) {
        const location = `objects/${obj.nameSingular}`;
        const locations = seen.get(obj.universalIdentifier) ?? [];
        locations.push(location);
        seen.set(obj.universalIdentifier, locations);
      }
      for (const field of obj.fields ?? []) {
        if (field.universalIdentifier) {
          const location = `objects/${obj.nameSingular}.fields.${field.label}`;
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

export const objectEntityBuilder = new ObjectEntityBuilder();
