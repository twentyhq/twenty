import { glob } from 'fast-glob';
import { type RoleManifest } from 'twenty-shared/application';
import { manifestExtractFromFileServer } from '@/cli/utilities/build/manifest/manifest-extract-from-file-server';
import { type ValidationError } from '@/cli/utilities/build/manifest/manifest-types';
import {
  type EntityBuildResult,
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from '@/cli/utilities/build/manifest/entities/entity-interface';

export class RoleEntityBuilder implements ManifestEntityBuilder<RoleManifest> {
  async build(appPath: string): Promise<EntityBuildResult<RoleManifest>> {
    const roleFiles = await glob(['**/*.role.ts'], {
      cwd: appPath,
      ignore: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/dist/**',
        '**/.twenty/**',
      ],
    });

    const manifests: RoleManifest[] = [];

    for (const filePath of roleFiles) {
      try {
        const absolutePath = `${appPath}/${filePath}`;

        const { manifest } =
          await manifestExtractFromFileServer.extractManifestFromFile<RoleManifest>(
            absolutePath,
          );

        manifests.push(manifest);
      } catch (error) {
        throw new Error(
          `Failed to load role from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { manifests, filePaths: roleFiles };
  }

  validate(roles: RoleManifest[], errors: ValidationError[]): void {
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
  }

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const seen = new Map<string, string[]>();
    const roles = manifest.roles ?? [];

    for (const role of roles) {
      if (role.universalIdentifier) {
        const location = `roles/${role.label}`;
        const locations = seen.get(role.universalIdentifier) ?? [];
        locations.push(location);
        seen.set(role.universalIdentifier, locations);
      }
    }

    return Array.from(seen.entries())
      .filter(([_, locations]) => locations.length > 1)
      .map(([id, locations]) => ({ id, locations }));
  }
}

export const roleEntityBuilder = new RoleEntityBuilder();
