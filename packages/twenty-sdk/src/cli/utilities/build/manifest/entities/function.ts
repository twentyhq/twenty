import chalk from 'chalk';
import { glob } from 'fast-glob';
import { type ServerlessFunctionManifest } from 'twenty-shared/application';
import { manifestExtractFromFileServer } from '../manifest-extract-from-file-server';
import { type ValidationError } from '../manifest.types';
import {
  type EntityBuildResult,
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from './entity.interface';

export class FunctionEntityBuilder
  implements ManifestEntityBuilder<ServerlessFunctionManifest>
{
  async build(appPath: string): Promise<EntityBuildResult<ServerlessFunctionManifest>> {
    const functionFiles = await glob(['**/*.function.ts'], {
      cwd: appPath,
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/.twenty/**'],
    });

    const manifests: ServerlessFunctionManifest[] = [];

    for (const filePath of functionFiles) {
      try {
        const absolutePath = `${appPath}/${filePath}`;

        manifests.push(
          await manifestExtractFromFileServer.extractManifestFromFile<ServerlessFunctionManifest>(
            absolutePath,
            { entryProperty: 'handler' },
          ),
        );
      } catch (error) {
        throw new Error(
          `Failed to load function from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { manifests, filePaths: functionFiles };
  }

  validate(
    functions: ServerlessFunctionManifest[],
    errors: ValidationError[],
  ): void {
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
  }

  display(functions: ServerlessFunctionManifest[]): void {
    console.log(chalk.green(`  ✓ Found ${functions.length} function(s)`));

    if (functions.length > 0) {
      console.log(chalk.gray(`  📍 Function entry points:`));
      for (const fn of functions) {
        const name = fn.name || fn.universalIdentifier;
        console.log(chalk.gray(`     - ${name} (${fn.handlerPath})`));
      }
    }
  }

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const seen = new Map<string, string[]>();
    const functions = manifest.serverlessFunctions ?? [];

    for (const fn of functions) {
      if (fn.universalIdentifier) {
        const location = `functions/${fn.name ?? fn.handlerName}`;
        const locations = seen.get(fn.universalIdentifier) ?? [];
        locations.push(location);
        seen.set(fn.universalIdentifier, locations);
      }
      for (const trigger of fn.triggers ?? []) {
        if (trigger.universalIdentifier) {
          const location = `functions/${fn.name ?? fn.handlerName}.triggers.${trigger.type}`;
          const locations = seen.get(trigger.universalIdentifier) ?? [];
          locations.push(location);
          seen.set(trigger.universalIdentifier, locations);
        }
      }
    }

    return Array.from(seen.entries())
      .filter(([_, locations]) => locations.length > 1)
      .map(([id, locations]) => ({ id, locations }));
  }
}

export const functionEntityBuilder = new FunctionEntityBuilder();
