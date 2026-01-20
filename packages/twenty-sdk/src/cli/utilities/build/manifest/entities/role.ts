import chalk from 'chalk';
import { glob } from 'fast-glob';
import { posix, relative, sep } from 'path';
import { type RoleManifest } from 'twenty-shared/application';
import { extractManifestFromFile } from '../manifest-file-extractor';
import { type ValidationError } from '../manifest.types';

const toPosixRelative = (filepath: string, appPath: string): string => {
  const rel = relative(appPath, filepath);
  return rel.split(sep).join(posix.sep);
};

export const buildRoles = async (appPath: string): Promise<RoleManifest[]> => {
  const roleFiles = await glob(['src/app/**/*.role.ts'], {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
  });

  const roleManifests: RoleManifest[] = [];

  for (const filepath of roleFiles) {
    try {
      roleManifests.push(
        await extractManifestFromFile<RoleManifest>(filepath, appPath),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load role from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return roleManifests;
};

export const validateRoles = (
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

export const displayRoles = (roles: RoleManifest[]): void => {
  console.log(chalk.green(`  ✓ Found ${roles?.length ?? 'no'} role(s)`));
};

export const collectRoleIds = (
  roles: RoleManifest[],
): Array<{ id: string; location: string }> => {
  const ids: Array<{ id: string; location: string }> = [];

  for (const role of roles) {
    if (role.universalIdentifier) {
      ids.push({
        id: role.universalIdentifier,
        location: `roles/${role.label}`,
      });
    }
  }

  return ids;
};
