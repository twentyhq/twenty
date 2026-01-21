import { toPosixRelative } from '@/cli/utilities/file/utils/file-path';
import chalk from 'chalk';
import { glob } from 'fast-glob';
import { type RoleManifest } from 'twenty-shared/application';
import { manifestExtractFromFileServer } from '../manifest-extract-from-file-server';
import { type ValidationError } from '../manifest.types';
import {
    type EntityIdWithLocation,
    type ManifestEntityBuilder,
    type ManifestWithoutSources,
} from './entity.interface';

export class RoleEntityBuilder implements ManifestEntityBuilder<RoleManifest[]> {
  async build(appPath: string): Promise<RoleManifest[]> {
    const roleFiles = await glob(['src/**/*.role.ts'], {
      cwd: appPath,
      absolute: true,
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
    });

    const roleManifests: RoleManifest[] = [];

    for (const filepath of roleFiles) {
      try {
        roleManifests.push(
          await manifestExtractFromFileServer.extractManifestFromFile<RoleManifest>(filepath),
        );
      } catch (error) {
        const relPath = toPosixRelative(filepath, appPath);
        throw new Error(
          `Failed to load role from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return roleManifests;
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

  display(roles: RoleManifest[]): void {
    console.log(chalk.green(`  ✓ Found ${roles?.length ?? 'no'} role(s)`));
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
