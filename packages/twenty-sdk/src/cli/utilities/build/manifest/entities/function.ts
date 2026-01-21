import chalk from 'chalk';
import { glob } from 'fast-glob';
import { posix, relative, sep } from 'path';
import { type ServerlessFunctionManifest } from 'twenty-shared/application';
import { extractManifestFromFile } from '../manifest-file-extractor';
import { type ValidationError } from '../manifest.types';

const toPosixRelative = (filepath: string, appPath: string): string => {
  const rel = relative(appPath, filepath);
  return rel.split(sep).join(posix.sep);
};

export const buildFunctions = async (
  appPath: string,
): Promise<ServerlessFunctionManifest[]> => {
  const functionFiles = await glob(['src/app/**/*.function.ts'], {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
  });

  const functionManifests: ServerlessFunctionManifest[] = [];

  for (const filepath of functionFiles) {
    try {
      functionManifests.push(
        await extractManifestFromFile<ServerlessFunctionManifest>(
          filepath,
          appPath,
          { entryProperty: 'handler' },
        ),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load function from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return functionManifests;
};

export const validateFunctions = (
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

export const displayFunctions = (functions: ServerlessFunctionManifest[]): void => {
  console.log(chalk.green(`  ✓ Found ${functions.length} function(s)`));

  if (functions.length > 0) {
    console.log(chalk.gray(`  📍 Function entry points:`));
    for (const fn of functions) {
      const name = fn.name || fn.universalIdentifier;
      console.log(chalk.gray(`     - ${name} (${fn.handlerPath})`));
    }
  }
};

export const collectFunctionIds = (
  functions: ServerlessFunctionManifest[],
): Array<{ id: string; location: string }> => {
  const ids: Array<{ id: string; location: string }> = [];

  for (const fn of functions) {
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

  return ids;
};
